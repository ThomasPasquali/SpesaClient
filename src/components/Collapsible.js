import React, { useState } from 'react'
import './css/Collapsible.css'

export default function Collapsible({ children, header, isopen}) {

    const [open, setOpen] = useState(isopen??true)

    const hideContent = () => setOpen(!open)
    
    return (
        <div className="collapsible">
            <h1 onClick={ hideContent }>{ header }</h1>
            { open && <div>{children}</div> }
        </div>
    )
}
