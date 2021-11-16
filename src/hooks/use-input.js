import { useState } from "react"

const useInput = (validationRule) => {
    const [input, setInput] = useState('')
    const [InputIsTouched, setInputIsTouched] = useState(false)

    const inputIsValid = validationRule(input)
    let inputHasError = InputIsTouched && !inputIsValid

    const inputChange = (e) => {
        setInput(e.target.value)
    }
    const inputBlur = (e) => {
        setInputIsTouched(true)
    }
    const reset = () => {
        setInputIsTouched(false)
        setInput('')
    }

    return {
        input,
        inputIsValid,
        inputHasError,
        inputChange,
        inputBlur,
        reset
    }
}

export default useInput;