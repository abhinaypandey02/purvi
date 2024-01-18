import logo from './logo.svg';
import './App.css';
import {useEffect, useRef, useState} from "react";
import { CSVLink } from "react-csv";
import {database} from "./firebase";
import {get,set,ref} from 'firebase/database'
import Mermaid from "react-mermaid2"
const flowchart_inputs = [
  {
    title:'Logical Flow and Decision Node Accuracy',
    key:'logical_score',
    options:[
      {
        label:'Excellent - The flowchart is clear, logical, well-structured, and aligns with process goals.',
        value:'test'
      },
      {
        label:'Test2',
        value:'test2'
      },
    ]
  },
  {
    title:'Overalll what is',
    key:'overall_score',
    options:[
      {
        label:'Test',
        value:'test'
      },
      {
        label:'Test2',
        value:'test2'
      },
    ]
  },
]

const other_answers=[
  {
    label:"Applied scenario",
    key:'applied_scenario'
  },
  {
    label:"Fact retrieval",
    key:'fact_retrieval'
  },
]

const answer_inputs = [
  {
    title:'Logical Flow and Decision Node Accuracy',
    key:'answer_correctness',
    options:[
      {
        label:'Test',
        value:'test',
        info:"I HAVE INFO"
      },
      {
        label:'Test2',
        value:'test2'
      },
    ]
  },
  {
    title:'Logical Flow and Decision Node Accuracy',
    key:'overall',
    options:[
      {
        label:'Test',
        value:'test'
      },
      {
        label:'Test2',
        value:'test2'
      },
    ]
  },
]
function Help({info}){
  const [show,setShow]=useState(false)
  return <div onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} className={'text-lg relative font-bold cursor-help'}>
    ?
    {show&&<div className={'absolute left-full -translate-y-1/2 text-xs font-normal border w-[300px] top-1/2 translate-x-2 bg-white p-2 rounded'}>{info}</div>}
  </div>
}
function Selector({inputs, path,defaultValues}){
  return <div>
    {inputs.map(input=><div  onChange={(e)=>{
      set(ref(database,path+'/'+input.key),e.target.value)
    }}>
      <div>{input.title}</div>
      {input.options.map(o=><div className={'flex gap-2'}>
        <input checked={defaultValues[input.key]===o.value} value={o.value} type={'radio'} name={path+input.key} placeholder={'Test'}/>
        <div>{o.label}</div>
        {o.info&&<Help info={o.info}/> }
      </div>)}
    </div>)}
  </div>
}

function AnswerInputRenderer({path, answers}){
  return <div>
    {answers.map((answer,i)=>answer&&<div>
      <h2>Question: {answer.Q}</h2>
      {Object.keys(answer).map(key=>key.startsWith('A')&&<p>{key}: {answer[key]}</p>)}
      <Selector path={path+'/'+i+'/scores'} inputs={answer_inputs} defaultValues={answer['scores']}/>
    </div>)}
  </div>
}

function App() {
  const inputRef = useRef()
  const [files,setFiles]=useState([])
  const [selectedFile,setSelectedFile]=useState()
  const [idText,setIdText]=useState('')
  const [completed,setCompleted]=useState()
  const [total,setTotal]=useState()
  useEffect(() => {
    get(ref(database,'/')).then(snapshot=>{
      const val = snapshot.val()
      setTotal(Object.keys(val).length)
      setCompleted(Object.values(val).filter(val=>val.scores?.flag).length)
    })
  }, []);
  function onSet(){
    get(ref(database,'/'+idText)).then(snapshot=>{
      setSelectedFile(snapshot.val())
    })
  }
  function onSubmit(){
    get(ref(database,'/'+idText)).then(snapshot=>{
      setSelectedFile(snapshot.val())
      const f = snapshot.val()
      console.log(Object.values(f['scores']))
      let all_done = Object.values(f['scores']).every(x=>Boolean(x)||x===0) && other_answers.every(answer=>Object.values(f['QA'][answer.key]['scores']).every(Boolean))
      if(all_done){
        set(ref(database,'/'+idText+'/scores/flag'),1)
      } else {
        alert('Please complete all')
      }
    })
  }
  return (
    <div className="App h-screen flex flex-col max-w-screen-xl mx-auto px-5">
      <div className={'py-5 flex justify-between'}>
        <div className={'text-4xl font-bold'}>Flowchart Quality Checker</div>
        <div className={'text-4xl font-bold'}>{completed}/{total}</div>
      </div>
      <input value={idText} onChange={e=>setIdText(e.target.value)} placeholder={'ID'}/>
      <button onClick={onSet}>Set</button>
      {selectedFile&&<div className={'grid grid-cols-2 overflow-auto pb-10'}>
        <div className={'overflow-y-scroll'}>

          <Mermaid chart={selectedFile?.mermaid?.split('\n').join(`
        `)}/>
        </div>
        <div className={'overflow-y-scroll overflow-x-visible'}>
          <h3>Flow chart questions</h3>
          <Selector path={`/${idText}/scores`} defaultValues={selectedFile.scores} inputs={flowchart_inputs}/>
          <hr/>
          <h3>Other questions</h3>
          {other_answers.map(answer=><div>
            <h5>{answer.label}</h5>
            <AnswerInputRenderer answers={selectedFile[answer.key]} path={`/${idText}/${answer.key}`}/>
            <hr/>
          </div>)}
        </div>
      </div>}
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}

export default App;
