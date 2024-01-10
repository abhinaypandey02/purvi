import logo from './logo.svg';
import './App.css';
import {useEffect, useRef, useState} from "react";
import { CSVLink } from "react-csv";
const value_inputs = [
  {
    title:'Logical Flow and Decision Node Accuracy',
    options:[
      {
        label:'1',
        value:'1'
      },
      {
        label:'2',
        value:'2'
      },
      {
        label:'3',
        value:'3'
      },
    ]
  },
  {
    title:'Complexity and Length',
    options:[
      {
        label:'1',
        value:'1'
      },
      {
        label:'2',
        value:'2'
      },
      {
        label:'3',
        value:'3'
      },
    ]
  },
  {
    title:'Alignment with Process Goals',

    options:[
      {
        label:'1',
        value:'1'
      },
      {
        label:'2',
        value:'2'
      },
      {
        label:'3',
        value:'3'
      },
    ]
  },
  {
    title:'Multiple Start Nodes or Subgraphs',

    options:[
      {
        label:'0',
        value:'0'
      },
      {
        label:'1',
        value:'1'
      },
    ]
  },
  {
    title:'Overall Quality Score',

    options:[
      {
        label:'1',
        value:'1'
      },
      {
        label:'2',
        value:'2'
      },
      {
        label:'3',
        value:'3'
      },
    ]
  },
]
function App() {
  const inputRef = useRef()
  const [files,setFiles]=useState([])
  const [selectedFile,setSelectedFile]=useState(-1)
  function handleFileChange(e){
    const input_files = e.target.files
    const mapped_files = []
    for(const file of input_files){
      mapped_files.push({

        url:URL.createObjectURL(file),
        data:{'Name':file.name}
      })
    }
    setSelectedFile(0)
    setFiles(o=>[...o,...mapped_files])
  }

  useEffect(() => {
    if(inputRef.current){
      inputRef.current.setAttribute("directory", "");
      inputRef.current.setAttribute("webkitdirectory", "");
    }
  }, []);
  return (
    <div className="App min-h-screen flex flex-col max-w-screen-xl mx-auto px-5">
      <input  type={'file'} multiple={true} onChange={handleFileChange} className={'hidden'} ref={inputRef}/>
      <div className={'py-5 flex justify-between'}>
        <div className={'text-4xl font-bold'}>Flowchart Quality Checker</div>
        <div className={'flex items-center gap-5'}>
          <button onClick={()=>inputRef.current?.click()}>Add Images</button>
          <CSVLink data={files.map(file=>file.data)}>Download CSV</CSVLink>
        </div>
      </div>
      {selectedFile>-1&&
          <div className={'flex grow items-center gap-4'}>
            {selectedFile>0&&<img onClick={()=>setSelectedFile(o=>o-1)} className={'cursor-pointer  scale-x-[-1]'} width="50" height="50" src="https://img.icons8.com/ios/50/circled-chevron-right--v1.png" alt="circled-chevron-right--v1"/>}
            <div className={'grid grow grid-cols-1 md:grid-cols-2 gap-10'}>
        <img src={files[selectedFile].url}/>
              <div className={'flex items-center'}>
                <div className={'grid grid-cols-2 gap-5'}>
                  {value_inputs.map((val,i)=><div className={'flex flex-col justify-between items-start gap-2'} key={''+selectedFile+i}>
                    <label className={'font-medium text-start'}>{val.title}</label>
                    {val.options?<select  className={'rounded-lg w-full border border-blue-900 py-3 px-5'} value={files[selectedFile].data[val.title]}
                                         onChange={e => setFiles(o => {
                                           o[selectedFile].data[val.title] = e.target.value
                                           return [...o]
                                         })}>
                      <option >
                        Select
                      </option>
                      {val.options.map(o=><option value={o.value}>{o.label}</option>)}
                    </select>:<input className={'rounded-lg w-full border border-blue-900 py-3 px-5'}
                            placeholder={'Enter value for ' + val.title} value={files[selectedFile].data[val.title]}
                            onChange={e => setFiles(o => {
                              o[selectedFile].data[val.title] = e.target.value
                              return [...o]
                            })}/>}

                  </div>)}
                </div>
              </div>
          </div>
            {selectedFile<files.length-1&&<img onClick={()=>setSelectedFile(o=>o+1)} className={'cursor-pointer'} width="50" height="50" src="https://img.icons8.com/ios/50/circled-chevron-right--v1.png" alt="circled-chevron-right--v1"/>}
          </div>}
    </div>
  );
}

export default App;
