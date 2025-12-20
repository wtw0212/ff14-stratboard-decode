/**
 * Game Code Export Dialog Button
 * ===============================
 *
 * Button and dialog for exporting XIVPlan scenes to FF14 in-game strategy codes.
 */

import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Field,
    MessageBar,
    MessageBarBody,
    Toast,
    ToastTitle,
    Textarea,
    makeStyles,
    useToastController,
} from '@fluentui/react-components';
import { CopyRegular, GamesRegular } from '@fluentui/react-icons';
import React, { useMemo, useState } from 'react';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { sceneToGameCode, getExportableStats, getDebugExportData } from './gameTypeMapping';
import { verifyStrategy } from './gameStrategyCodec';

export interface GameCodeExportButtonProps {
    children?: React.ReactNode;
}

const useStyles = makeStyles({
    textarea: {
        fontFamily: 'monospace',
        fontSize: '12px',
    },
    warning: {
        marginTop: '12px',
    },
    stats: {
        marginBottom: '12px',
        fontSize: '14px',
    },
    debugSection: {
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px',
        maxHeight: '300px',
        overflowY: 'auto',
    },
    debugTable: {
        width: '100%',
        fontSize: '11px',
        fontFamily: 'monospace',
        borderCollapse: 'collapse',
    },
    tabList: {
        marginBottom: '12px',
    },
});

export const GameCodeExportButton: React.FC<GameCodeExportButtonProps> = ({ children }) => {
    return (
        <Dialog>
            <DialogTrigger>
                <CollapsableToolbarButton icon={<GamesRegular />}>{children}</CollapsableToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <GameCodeExportDialogBody />
            </DialogSurface>
        </Dialog>
    );
};

const GameCodeExportDialogBody: React.FC = () => {
    const classes = useStyles();
    const { canonicalScene } = useScene();
    const currentStep = 0; // Default to first step
    const { dispatchToast } = useToastController();

    // State
    const [exportTitle, setExportTitle] = useState('XIVPlan Export');
    const [showDebug, setShowDebug] = useState(false);

    // Get stats about exportable objects
    const stats = useMemo(() => {
        return getExportableStats(canonicalScene, currentStep);
    }, [canonicalScene, currentStep]);

    // Get debug data
    const debugData = useMemo(() => {
        return getDebugExportData(canonicalScene, currentStep);
    }, [canonicalScene, currentStep]);

    // Generate game code
    const { gameCode, error, isValid } = useMemo(() => {
        try {
            if (stats.exportable === 0) {
                return { gameCode: '', error: 'No exportable objects found', isValid: false };
            }
            const code = sceneToGameCode(canonicalScene, currentStep, exportTitle);
            // Validate by decoding the generated code
            const valid = verifyStrategy(code);
            return { gameCode: code, error: null, isValid: valid };
        } catch (e) {
            return { gameCode: '', error: e instanceof Error ? e.message : 'Unknown error', isValid: false };
        }
    }, [canonicalScene, currentStep, exportTitle, stats]);

    const copyToClipboard = async () => {
        if (gameCode) {
            await navigator.clipboard.writeText(gameCode);
            dispatchToast(
                <Toast>
                    <ToastTitle>Game code copied!</ToastTitle>
                </Toast>,
                { intent: 'success' }
            );
        }
    };

    const copyDebugToClipboard = async () => {
        const debugText = JSON.stringify(debugData, null, 2);
        await navigator.clipboard.writeText(debugText);
        dispatchToast(
            <Toast>
                <ToastTitle>Debug data copied!</ToastTitle>
            </Toast>,
            { intent: 'success' }
        );
    };

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>Export to Game</DialogTitle>
            <DialogContent>
                <div className={classes.stats}>
                    <strong>
                        {stats.exportable} / {stats.total}
                    </strong>{' '}
                    objects can be exported
                </div>

                {stats.unsupported.length > 0 && (
                    <MessageBar intent="warning" className={classes.warning}>
                        <MessageBarBody>
                            Unsupported types (will be skipped): {stats.unsupported.join(', ')}
                        </MessageBarBody>
                    </MessageBar>
                )}

                <Field label="Strategy Title">
                    <Textarea
                        value={exportTitle}
                        onChange={(e, data) => setExportTitle(data.value)}
                        rows={1}
                    />
                </Field>

                <Field label="Game Strategy Code" style={{ marginTop: '12px' }}>
                    <Textarea
                        value={error || gameCode}
                        className={classes.textarea}
                        readOnly
                        rows={6}
                        appearance="filled-darker"
                    />
                </Field>

                {gameCode && !error && (
                    <p style={{ fontSize: '12px', marginTop: '4px', color: isValid ? '#4caf50' : '#ff5722' }}>
                        {isValid ? '✓ Code validation passed' : '✗ Code validation failed - may not import correctly'}
                    </p>
                )}

                <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                    Paste this code in the FF14 game chat to share the strategy.
                </p>
                <p style={{ fontSize: '12px', color: '#f5a623', marginTop: '4px' }}>
                    ⚠️ Elements may appear differently in-game. Please double-check after importing.
                </p>

                <Checkbox
                    label="Show debug info"
                    checked={showDebug}
                    onChange={(e, data) => setShowDebug(data.checked === true)}
                    style={{ marginTop: '12px' }}
                />

                {showDebug && (
                    <div className={classes.debugSection}>
                        <p style={{ fontSize: '12px', marginBottom: '8px', color: '#aaa' }}>
                            <strong>Arena:</strong> {debugData.arenaInfo.width}x{debugData.arenaInfo.height} →
                            Scale: {debugData.arenaInfo.scaleX.toFixed(3)} x {debugData.arenaInfo.scaleY.toFixed(3)}
                        </p>
                        <table className={classes.debugTable}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #444' }}>
                                    <th style={{ textAlign: 'left', padding: '4px' }}>Type</th>
                                    <th style={{ textAlign: 'left', padding: '4px' }}>Name</th>
                                    <th style={{ textAlign: 'right', padding: '4px' }}>GameID</th>
                                    <th style={{ textAlign: 'right', padding: '4px' }}>Scale</th>
                                    <th style={{ textAlign: 'right', padding: '4px' }}>A</th>
                                    <th style={{ textAlign: 'right', padding: '4px' }}>B</th>
                                </tr>
                            </thead>
                            <tbody>
                                {debugData.objects.map((obj, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '4px' }}>{obj.originalType}</td>
                                        <td style={{ padding: '4px' }}>{obj.originalName || '-'}</td>
                                        <td style={{ padding: '4px', textAlign: 'right' }}>0x{obj.gameTypeId.toString(16).toUpperCase()}</td>
                                        <td style={{ padding: '4px', textAlign: 'right' }}>{obj.scale}</td>
                                        <td style={{ padding: '4px', textAlign: 'right' }}>{obj.paramA}</td>
                                        <td style={{ padding: '4px', textAlign: 'right' }}>{obj.paramB}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {debugData.skipped.length > 0 && (
                            <p style={{ fontSize: '11px', color: '#f88', marginTop: '8px' }}>
                                <strong>Skipped:</strong> {debugData.skipped.join(', ')}
                            </p>
                        )}
                        <Button size="small" onClick={copyDebugToClipboard} style={{ marginTop: '8px' }}>
                            Copy Debug JSON
                        </Button>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    appearance="primary"
                    icon={<CopyRegular />}
                    onClick={copyToClipboard}
                    disabled={!gameCode || !!error}
                >
                    Copy to Clipboard
                </Button>

                <DialogTrigger disableButtonEnhancement>
                    <Button>Close</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};
