import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import fs from 'fs';
import { spawn } from 'child_process';
import { pool } from './db.js';
import { error } from 'console';

const app = express();
const PORT = 5000;

//  Middleware setup
app.use(cors());
app.use(fileUpload());

// Ensure uploads folder exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.post('/transcribe', async (req, res) => {
  if (!req.files || !req.files.audio) {
    return res.status(400).send('No file uploaded.');
  }

  const audioFile = req.files.audio;
  const filePath = `uploads/${Date.now()}_${audioFile.name}`;
  await audioFile.mv(filePath); // Save the file first

  // Run Python Whisper
  const python = spawn('C:/Users/DELL/AppData/Local/Programs/Python/Python312/python.exe', ['whispertranscribe.py', filePath]);

  let result = '';
  python.stdout.on('data', (data) => {
    result += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });

  python.on('close', (code) => {
    fs.unlinkSync(filePath); // delete file after use
    try {
      const output = JSON.parse(result);
      res.json({ text: output.text });
    } catch (e) {
      console.error('Parsing error:', e);
      res.status(500).send('Transcription failed.');
    }
  });
});

app.post('/savenote',express.json(),async(req,res)=>{

  const{title,text}=req.body;

  if(!text){
    return res.status(400).json({
      error:'Transcription text is required'
    });
  }

  try {
    const result=await pool.query('INSERT INTO notes (title,transcription) VALUES ($1,$2) RETURNING *',[title || 'untitled',text]);
    res.json(result.rows[0]);

  } catch (err) {
    console.log('error saving note :',err);
    res.status(500).json({
      error:'Failed to save note'
    });
  }
});

app.put('/updatenote/:id',express.json(),async(req,res)=>{
  const{title,text}=req.body;
  const {id}=req.params;

  try{
    const result=await pool.query('UPDATE notes SET title=$1 ,transcription =$2 WHERE id=$3',[title,text,id]);
    res.json(result.rows[0]);

  }catch(err){
    console.error('Error updating note:',err);
    res.status(500).json({
      error:'Failed to update note'
    });
  }
});


app.delete('/deletenode/:id',async(req,res)=>{
  const{id}=req.params;
  try {
    await pool.query('DELETE FROM notes WHERE id = $1',[id]);
    res.json({
      success:true , message:'Note deleted'
    });

  } catch (err) {
    console.error('Error deleting node',err);
    res.status(500).json({
      error:'Failed to delete node'
    });
    
  }
});


app.get('/notes',async(req,res)=>{
  try{
  const result=await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
   res.json(result.rows);
  }catch(err){
    console.error('Error fetching notes',err);
    res.status(500).json({
      error:'Failed to load notes'
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
