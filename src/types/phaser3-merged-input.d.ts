import "phaser3-merged-input";

declare module "phaser3-merged-input" {
	export interface Player {
		buttons_mapped: {
			LB: 0 | 1;
			RB: 0 | 1;
			START: 0 | 1;
			SELECT: 0 | 1;
			RC_E: 0 | 1;
			RC_W: 0 | 1;
			LC_N: 0 | 1;
			LC_S: 0 | 1;
		};
	}
}
