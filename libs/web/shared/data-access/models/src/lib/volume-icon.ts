export class VolumeIcon {
  constructor(
    public volume: number,
    public icon: string,
    public title: string,
  ) {}
}

export class VolumeHighIcon extends VolumeIcon {
  constructor(volume: number) {
    super(volume, 'volume-high', 'Mute');
  }
}

export class VolumeMediumIcon extends VolumeIcon {
  constructor(volume: number) {
    super(volume, 'volume-medium', 'Mute');
  }
}

export class VolumeMuteIcon extends VolumeIcon {
  constructor() {
    super(0, 'volume-mute', 'Unmute');
  }
}
