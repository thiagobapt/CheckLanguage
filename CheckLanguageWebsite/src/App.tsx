import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactCodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import {LRLanguage} from "@codemirror/language"
import {completeFromList} from "@codemirror/autocomplete"
import {parser} from "./CheckLang"
import {foldNodeProp, foldInside, indentNodeProp} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"
import {LanguageSupport} from "@codemirror/language"

let parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Name: t.variableName,
      Number: t.number,
      Boolean: t.bool,
      String: t.string,
      Initialization: t.definition(t.atom),
      Assignment: t.definition(t.atom),
      If_Statement: t.controlKeyword,
      Else_Statement: t.controlKeyword,
      Function_Call: t.bool,
      "( )": t.paren,
      "{ }": t.bracket,
      "=": t.operator
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

  return (
    <>
      <div className="w-full h-screen">
        <ReactCodeMirror height="full" value={text} theme={vscodeDark} extensions={[check()]}/>
      </div>
    </>
  )
}

export default App
