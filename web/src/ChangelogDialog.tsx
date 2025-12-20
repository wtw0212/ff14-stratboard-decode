import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    makeStyles,
    typographyStyles,
} from '@fluentui/react-components';
import { HistoryRegular } from '@fluentui/react-icons';
import React, { useState } from 'react';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';
import { CollapsableToolbarButton } from './CollapsableToolbarButton';

import { commits } from 'virtual:git-commits';

// Group commits by date
const COMMITS_BY_DATE = commits.reduce((acc, commit) => {
    const date = commit.date;
    if (!acc[date]) {
        acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
}, {} as Record<string, typeof commits>);

export interface ChangelogDialogButtonProps {
    children?: React.ReactNode;
}

export const ChangelogDialogButton: React.FC<ChangelogDialogButtonProps> = ({ children }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={(ev, data) => setOpen(data.open)}>
            <DialogTrigger disableButtonEnhancement>
                <CollapsableToolbarButton icon={<HistoryRegular />}>
                    {children ?? 'Changelog'}
                </CollapsableToolbarButton>
            </DialogTrigger>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>Recent Changes</DialogTitle>
                    <DialogContent className={classes.content}>
                        {Object.entries(COMMITS_BY_DATE)
                            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                            .map(([date, dayCommits]) => (
                                <div key={date} className={classes.entry}>
                                    <h2>{date}</h2>
                                    <ul>
                                        {dayCommits.map((commit) => (
                                            <li key={commit.hash} title={commit.hash}>
                                                <span className={classes.time}>{commit.time.substring(0, 5)}</span>
                                                <span className={classes.message}>{commit.message}</span>
                                                {commit.body && (
                                                    <div className={classes.body}>
                                                        {commit.body.split('|').map((line, i) => (
                                                            <div key={i}>{line}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const useStyles = makeStyles({
    content: {
        maxHeight: '400px',
        overflowY: 'auto',
        '& h2': {
            ...typographyStyles.subtitle2,
            marginTop: '16px',
            marginBottom: '8px',
            borderBottom: '1px solid #333',
            paddingBottom: '4px',
        },
        '& ul': {
            marginTop: '4px',
            marginBottom: '8px',
            paddingLeft: '0',
            listStyle: 'none',
        },
        '& li': {
            marginBottom: '12px',
            display: 'flex',
            flexDirection: 'column',
        },
    },
    entry: {
        '&:first-child h2': {
            marginTop: 0,
        },
    },
    time: {
        color: '#888',
        fontSize: '0.85em',
        fontFamily: 'monospace',
        marginBottom: '2px',
    },
    message: {
        fontWeight: 'bold',
        marginBottom: '4px',
    },
    body: {
        fontSize: '0.9em',
        color: '#ccc',
        paddingLeft: '8px',
        borderLeft: '2px solid #444',
        whiteSpace: 'pre-wrap',
    },
});
