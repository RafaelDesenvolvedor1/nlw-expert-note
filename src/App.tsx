// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import {Card} from './Componentes/Card'

import * as Dialog from '@radix-ui/react-dialog'
import {Search, X} from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface Note{
  id:string
  date: Date
  content: string
}

let speechRecognition: SpeechRecognition | null = null

export function App() {

  const [shoudShowOnboarding, setshoudShowOnboarding]=useState(true)
  const [content, setContent]=useState('')
  const [search, setSearch]=useState('')

  const [isrecording, setIsRecording]=useState(false)



  const [notas, setNotas]=useState<Note[]>(()=>{
    const notesOnStorage=localStorage.getItem('notes')

    if(notesOnStorage){
      return JSON.parse(notesOnStorage)
    }
    return []
  })

function handleSearch(e:ChangeEvent<HTMLInputElement>){
  const query=e.target.value

  setSearch(query)
}

const filterNotes=search !=''
? notas.filter(nota=>nota.content.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
: notas

  function handleStartEditor(){
    setshoudShowOnboarding(false)
  }

  function handleContentChanged(e: ChangeEvent<HTMLTextAreaElement>){
    setContent(e.target.value)
    if(e.target.value===''){
      setshoudShowOnboarding(true)
    }
  }

  function handleSaveNote(e: FormEvent){
    e.preventDefault()

    if(content!=''){
      onNoteCreate(content)
      setContent('')
      setshoudShowOnboarding(true)
      toast.success('Nota criada com sucesso')
    }

  }

  function onNoteCreate(content:string){
    const newNote={
      id:crypto.randomUUID(),
      date:new Date(),
      content,
    }

    const notesArray=[newNote,...notas]

    setNotas(notesArray)

    localStorage.setItem('notes', JSON.stringify(notesArray))
  }

  function handleStartRecording(){
    setIsRecording(true)
    setshoudShowOnboarding(false)

    const isSpeechRecognitionAPIAvailable='SpeechRecognition' in window
    || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable){
      alert('Infelizmente o seu navegador não suporta esse recurso!')
      return
    }

    const SpeechRecognitionAPI=window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition= new SpeechRecognitionAPI()

    speechRecognition.lang='pt-BR'
    speechRecognition.continuous=true
    speechRecognition.maxAlternatives=1
    speechRecognition.interimResults=true



    speechRecognition.onresult=(e)=>{
      const transcription=Array.from(e.results).reduce((text,result)=>{
        return text.concat(result[0].transcript)
      },'')


      setContent(transcription)
    }
   
    speechRecognition.onerror=(e)=>{
      console.error(e)
    }

    speechRecognition.start()
    
  }

  function handleStopRecording(){
    setIsRecording(false)

    if(speechRecognition!=null){
      speechRecognition.stop()

    }
  }

  function onNoteDeleted(id:string){
    const notesArray=notas.filter(note=>{
      return note.id != id
    })
    setNotas(notesArray)

    localStorage.setItem('notes', JSON.stringify(notesArray))
  }
  

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <h1 >Expert Notes</h1>
      <form className="w-full ">
        <input 
          type="text"
          placeholder="Busque em suas notas..."
          className="w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none"
          onChange={handleSearch}
        />
      </form>
      <div className="h-px bg-slate-700"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
      <Dialog.Root>
        <Dialog.Trigger onClick={()=>{setshoudShowOnboarding(true)}} className="rounded-md bg-slate-700 flex flex-col p-5 gap-3 text-left hover:ring-slate-600  focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
          <span className='text-sm font-medium text-slate-500 '>Adicionar nota</span>
          <p className='text-sm leading-6 text-slate-400'>Grave uma nota em audio que será convertida para texto automatico</p>
        </Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Overlay  className='inset-0 fixed bg-black/50'></Dialog.Overlay>
            <Dialog.Content className='inset-0 md-inset-auto overflow-hidden fixed md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
                <Dialog.DialogClose  className='absolute right-0 top-0 p-1.5 bg-slate-800 text-slate-400 hover:text-slate-100'>
                    <X className='size-5'/>
                </Dialog.DialogClose>
                 
                <form className='flex-1 flex flex-col'>
                <div className='flex flex-1 flex-col gap-3 p-5'>
                    <span className='text-sm font-medium text-slate-300 '>
                      Adicionar Nota
                    </span>
                   {
                    shoudShowOnboarding ? (
                        <p className='text-sm leading-6 text-slate-400'>
                        Comece <button type='button' onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota em audio</button > ou se preferir <button onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                      </p>    
                    ):(
                      <textarea
                        autoFocus
                        className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                        value={content}
                        onChange={handleContentChanged}
                      />
                    )
                   }
                </div>

                {
                  isrecording ? (
                        <button
                        type='button'
                        onClick={handleStopRecording}
                        className=' flex items-center justify-center gap-3 w-full bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'
                    >
                      <div className='animate-pulse size-3 rounded-full bg-red-500'></div>
                        Gravando(clique p/ interromper)
                    </button>
                  ):(
                      <button
                      type='button'
                      onClick={handleSaveNote}
                      className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
                  >
                      Salvar Nota
                  </button>
                  )
                }


                </form>
            </Dialog.Content>
        </Dialog.Portal>
     </Dialog.Root>
 

        {/* <Card date={new Date()} content='Hello world'/> */}
        {
          filterNotes.map(nota=>{
            return <Card id={nota.id} key={nota.id} date={nota.date} content={nota.content} onNoteDeleted={onNoteDeleted}/>
          })
        }

      </div>
    </div>
  )
}


