import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import {LRLanguage} from "@codemirror/language"
import {completeFromList} from "@codemirror/autocomplete"
import {parser} from "./CheckLang"
import {foldNodeProp, foldInside, indentNodeProp} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import {LanguageSupport} from "@codemirror/language"
import {interpretProgram} from "../../src/interpreter"

let parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Name: t.name,
      Number: t.number,
      Boolean: t.bool,
      String: t.string,
      Initialization: t.definition(t.atom),
      Assignment: t.definition(t.atom),
      If_Statement: t.controlKeyword,
      Else_Statement: t.controlKeyword,
      While_Statement: t.controlKeyword,
      For_Statement: t.controlKeyword,
      Return_Statement: t.controlKeyword,
      "Function_Call/Parameter": t.name,
      "Function_Call/Name": t.function(t.attributeName),
      "Function_Declaration": t.definition(t.atom),
      "Function_Declaration/Name": t.function(t.attributeName),
      "Parameter_Declaration/Types": t.atom,
      Logical_Operator: t.logicOperator,
      Expression_Operator: t.arithmeticOperator,
      Term_Operator: t.arithmeticOperator,
      Comment: t.comment,
      "( )": t.paren,
      "{ }": t.bracket,
      "= ; ,": t.operator,
    }),
    indentNodeProp.add({
      Application: context => context.column(context.node.from) + context.unit
    }),
    foldNodeProp.add({
      Application: foldInside
    })
  ]
})

const checkLanguage = LRLanguage.define({
  parser: parserWithMetadata
})

const checkCompletion = checkLanguage.data.of({
  autocomplete: completeFromList([
    {label: "var", type: "keyword"},
    {label: "if", type: "keyword"},
    {label: "else", type: "keyword"},
    {label: "function", type: "keyword"},
    {label: "while", type: "keyword"},
    {label: "return", type: "keyword"},
    {label: "string", type: "type"},
    {label: "number", type: "type"},
    {label: "bool", type: "type"},
    {label: "printLn", type: "function"},
    {label: "concat", type: "function"},
  ])
})

function check() {
  return new LanguageSupport(checkLanguage, [checkCompletion])
}


function App() {

  const [text, setText] = useState(`/* 
This is a demonstration of the Check Language with the recursive function "fibonacci" that return the fibonacci sequence.
*/

printLn("Fibonacci sequence: ")

function fibonacci(number previousValue, number currentValue) {
  if(currentValue < 100) { 
    var novoValor = currentValue + previousValue;
    printLn(currentValue)
    return fibonacci(currentValue, novoValor);
  } else {
    return currentValue;
  }
}

printLn(fibonacci(0, 1))`);
  const [output, setOutput] = useState("");

  return (
    <>
      <div className="w-screen h-screen">
        <div className="h-3/5 overflow-auto">
          <ReactCodeMirror value={text} onChange={(e) => {setText(e)}} theme={vscodeDark} extensions={[check()]}/>
        </div>
        <div className="h-2/5 p-1 w-screen flex flex-col place-content-center space-y-1 overflow-hidden">
          <div className="flex place-content-center">
            <button className="h-fit w-fit hover:bg-slate-800 focus:outline-none" onClick={() => {
              let result = "";
              try {
                result = interpretProgram(text)!;
                console.group
              } catch (e: any) {
                result = e;
              }
              setOutput(result);
            }}>Rodar</button>
          </div>
          <textarea className="w-full h-full disabled:bg-stone-900" value={output} disabled></textarea>
        </div>
      </div>
    </>
  )
}

export default App
