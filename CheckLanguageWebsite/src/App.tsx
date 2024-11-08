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
      Function_Call: t.controlKeyword,
      Logical_Operator: t.logicOperator,
      Expression_Operator: t.arithmeticOperator,
      Term_Operator: t.arithmeticOperator,
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
  ])
})

function check() {
  return new LanguageSupport(checkLanguage, [checkCompletion])
}


function App() {

  const [text, setText] = useState("");
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
