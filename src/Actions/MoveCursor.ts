import {window, Position, Selection} from 'vscode';
import {ActionReveal} from './Reveal';
import {Motion} from '../Motions/Motion';
import {MotionCharacter} from '../Motions/Character';

export class ActionMoveCursor {

    static byMotions(args: {
        motions: Motion[],
        isVisualMode?: boolean,
        isVisualLineMode?: boolean,
        noEmptyAtLineEnd?: boolean
    }): Thenable<boolean> {
        args.isVisualMode = args.isVisualMode === undefined ? false : args.isVisualMode;
        args.isVisualLineMode = args.isVisualLineMode === undefined ? false : args.isVisualLineMode;
        args.noEmptyAtLineEnd = args.noEmptyAtLineEnd === undefined ? false : args.noEmptyAtLineEnd;

        const activeTextEditor = window.activeTextEditor;

        if (! activeTextEditor) {
            return Promise.resolve(false);
        }

        // TODO: Preserve character position

        const document = activeTextEditor.document;

        activeTextEditor.selections = activeTextEditor.selections.map(selection => {
            let anchor: Position;

            let active = args.motions.reduce((position, motion) => {
                return motion.apply(position, {isInclusive: args.isVisualMode});
            }, selection.active);

            if (args.isVisualMode) {
                anchor = selection.anchor;

                if (anchor.isEqual(active)) {
                    if (active.isBefore(selection.active)) {
                        anchor = anchor.translate(0, +1);
                        if (active.character > 0) {
                            active = active.translate(0, -1);
                        }
                    }
                    else {
                        if (anchor.character > 0) {
                            anchor = anchor.translate(0, -1);
                        }
                        active = active.translate(0, +1);
                    }
                }
            }
            else if (args.isVisualLineMode) {
                anchor = selection.anchor;

                if (anchor.isBefore(active)) {
                    anchor = anchor.with(undefined, 0);
                    active = active.with(undefined, activeTextEditor.document.lineAt(active.line).text.length);
                }
                else {
                    anchor = anchor.with(undefined, activeTextEditor.document.lineAt(anchor.line).text.length);
                    active = active.with(undefined, 0);
                }
            }
            else {
                if (args.noEmptyAtLineEnd) {
                    const lineEndCharacter = document.lineAt(active.line).text.length;
                    if (lineEndCharacter !== 0 && active.character === lineEndCharacter) {
                        active = active.translate(0, -1);
                    }
                }

                anchor = active;
            }

            return new Selection(anchor, active);
        });

        return ActionReveal.primaryCursor();
    }

}
