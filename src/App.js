import './App.css';
import React, {useEffect, useState} from "react";
import {database} from "./firebase";
import {get,set,ref} from 'firebase/database'
import mermaid from 'mermaid'
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
  return <div className={'grid grid-cols-2 gap-3'}>
    {inputs.map(input=><div className={'bg-white rounded-md border shadow py-3 px-6'}  onChange={(e)=>{
      set(ref(database,path+'/'+input.key),e.target.value)
    }}>
      <div className={'text- font-medium text-start mb-3'}>{input.title}</div>
      <div className={'flex flex-col gap-1'}>

        {input.options.map(o=><div className={'flex items-center gap-2'}>
          <input className={'text-left'} defaultChecked={defaultValues[input.key]===o.value} value={o.value} type={'radio'} name={path+input.key} placeholder={'Test'}/>
          <div className={'text-left'}>{o.label}</div>
          {o.info&&<Help info={o.info}/> }
        </div>)}
      </div>
    </div>)}
  </div>
}

function AnswerInputRenderer({path, answers}){
  return <div>
    {answers.map((answer,i)=>answer&&<div className={'text-left'}>
      <h2 className={'mb-2'}><b><u>Question:</u></b> {answer.Q}</h2>
      {Object.keys(answer).map(key=>key.startsWith('A')&&<p><b>{key}:</b> {answer[key]}</p>)}<br/>
      <Selector path={path+'/'+i+'/scores'} inputs={answer_inputs} defaultValues={answer['scores']}/>
      <hr className={'my-8'}/>
    </div>)}
  </div>
}

function App() {
  const [selectedFile,setSelectedFile]=useState()
  const [idText,setIdText]=useState('')
  const [completed,setCompleted]=useState()
  const [total,setTotal]=useState()
  const [loading,setLoading]=useState(false)
  useEffect(() => {
    mermaid.run();
  }, [selectedFile]);
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true })
    get(ref(database,'/')).then(snapshot=>{
      const val = snapshot.val()
      setTotal(Object.keys(val).length)
      setCompleted(Object.values(val).filter(val=>val.scores?.flag).length)
    })
  }, []);
  function onSet(){
    setLoading(true)
    get(ref(database,'/'+idText)).then(snapshot=>{
      if(!snapshot.val()){
        return alert('Invalid code')
      }
      setSelectedFile(snapshot.val())

    })
        .finally(()=>{
          setLoading(false)
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
    <div className="App h-screen flex flex-col max-w-screen-xl mx-auto px-5 text-start">
      <div className={'py-5 flex justify-between'}>
        <div className={'text-4xl font-bold'}>Flowchart Quality Checker</div>
        <div className={'text-4xl font-bold'}>{completed}/{total}</div>
      </div>
      <form className={'flex gap-3 items-center'} onSubmit={e=>{
        e.preventDefault()
        onSet()
      }}>
        <input disabled={loading} className={'grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'} value={idText} onChange={e=>setIdText(e.target.value)} placeholder={'Enter ID'}/>
        <button disabled={loading} className={'text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center'} onClick={onSet}>Set</button>
      </form>
      {selectedFile&&<div className={'grid grid-cols-2 overflow-auto pb-10'}>
        <div className={'overflow-y-scroll'}>
        <pre className="mermaid">
          {selectedFile?.mermaid}
        </pre>
        </div>
        <div className={'overflow-y-scroll overflow-x-visible'}>
            <h3 className={'text-3xl font-semibold mb-8 mt-8'}>Flow chart questions</h3>
            <Selector path={`/${idText}/scores`} defaultValues={selectedFile.scores} inputs={flowchart_inputs}/>
          <h3 className={'text-3xl font-semibold mb-4 mt-8'}>Other questions</h3>
          {other_answers.map(answer=><div>
            <h5 className={'text-2xl font-medium underline mb-5 mt-8'}>{answer.label}</h5>
            <AnswerInputRenderer answers={selectedFile[answer.key]} path={`/${idText}/${answer.key}`}/>
          </div>)}
          <button className={'w-full text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center'} onClick={onSubmit}>Submit</button>

        </div>
      </div>}

    </div>
  );
}

export default App;
