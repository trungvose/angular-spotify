export class VolumeIcon {
  constructor(public volume: number, public icon: string) {}
}

export class VolumeHighIcon extends VolumeIcon {
  constructor(volume: number) {
    super(volume, 'volume-high');
  }
}

export class VolumeMediumIcon extends VolumeIcon {
  constructor(volume: number) {
    super(volume, 'volume-medium');
  }
}

export class VolumeMuteIcon extends VolumeIcon {
  constructor() {
    super(0, 'volume-mute');
  }
}
