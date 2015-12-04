import {ModesNormal} from './Modes/Normal';

enum MODE {NORMAL, VISUAL, VISUAL_BLOCK, INSERT};

export class Dispatcher {

	private currentMode = MODE.NORMAL;
	private modes = {
		[MODE.NORMAL]: new ModesNormal(),
		// [MODE.VISUAL]: new ModesVisual(),
		// [MODE.VISUAL_BLOCK]: new ModesVisualBlock(),
		// [MODE.INSERT]: new ModesInsert(),
	};

	public inputHandler(key: string): any {
		return () => {
			this.modes[this.currentMode].input(key);
		};
	}

	public dispose(): void {
		// Nothing to clear now.
	}
}