import { Chip } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import React, { useState } from 'react'

export default function GroupSelector({ groups=[], selectedGroup, setSelectedGroup }) {
    const gr = useState(groups)[0]

    return (
        <div id="groups">
            {   selectedGroup &&
                <Chip
                    key={selectedGroup.id}
                    label={selectedGroup.nome}
                    variant="outlined"
                    icon={<CheckCircleIcon />}
                />
            }
            { 
                gr.map(group => 
                    (selectedGroup == null || group.id !== selectedGroup.id) &&
                    <Chip
                        key={group.id}
                        label={group.nome}
                        onClick={_ => setSelectedGroup(group)}
                        variant="outlined"
                    />
                )
            }
        </div>
    )
}
