import whisper
import sys
import json

model=whisper.load_model("base")#loading the type of model 

def transcribe(audiopath):
    result=model.transcribe(audiopath)
    print(json.dumps(result))#to convert to stdout for nodejs to read


if __name__ =="__main__":
    transcribe(sys.argv[1])

