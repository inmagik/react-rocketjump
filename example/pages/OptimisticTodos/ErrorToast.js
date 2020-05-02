import React from 'react'
import { useEffect, useRef } from 'react'

function ErrorToast({ errors, setErrors, time = 1500 }) {
  const prevErrors = useRef(errors)
  const timeoutsRef = useRef(new Set())

  useEffect(() => {
    const newErrors = errors.filter(
      (a) => prevErrors.current.indexOf(a) === -1 && !a.fadeout
    )
    prevErrors.current = errors
    const timeouts = timeoutsRef.current
    let shift = 0

    newErrors.forEach((error) => {
      const tid = setTimeout(() => {
        timeouts.delete(tid)

        const fadeOutError = {
          ...error,
          fadeout: true,
        }
        setErrors((errors) => {
          return errors.map((a) => (a === error ? fadeOutError : a))
        })

        const innerTid = setTimeout(() => {
          setErrors((errors) => {
            return errors.filter((a) => a !== fadeOutError)
          })
          timeouts.delete(innerTid)
        }, 800)
        timeouts.add(innerTid)
      }, time + shift)
      shift += 600
      timeouts.add(tid)
    })
  }, [errors, time, setErrors])

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      // Good Bye Space Cowboy
      timeouts.forEach((tid) => clearTimeout(tid))
    }
  }, [])
  console.log('Render Errors', errors)

  return (
    <div className="todos-opt-toasts-container">
      {errors.map((error, i) => (
        <div
          className={`todos-opt-toast-error ${
            error.fadeout ? 'toast-fade-out' : ''
          }`}
          key={i}
        >
          {error.message}
        </div>
      ))}
    </div>
  )
}
export default React.memo(ErrorToast)
