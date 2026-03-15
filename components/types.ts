export interface Driver {
  id: number,
  Brand: string,
  model: string
  type: string,
  status: 'Active' | 'Preliminary' | 'Discontinued',
  size: number, // [in] -> [cm]
  Re: number, // [ohm] DC resistance of the driver measured with an ohm meter
  Fs: number, // [Hz]  free-air resonant frequency of a speaker
  Qms: number, //the control coming from the speaker's mechanical suspension system (the surround and spider)
  Qes: number, //the control coming from the speaker's electrical suspension system (the voice coil and magnet)
  Qts: number, //the 'Total Q' of the driver and is derived from an equation where Qes is multiplied by Qms and the result is divided by the sum of the same
  Rms: number, // [Ns/m]
  Mms: number, // [kg]   the weight of the cone assembly plus the driver radiation mass load
  Cms: number, //[m/N] compliance (Cms) of the suspension. the force exerted by the mechanical suspension of the speaker. It is simply a measurement of its stiffness
  Vas: number, //[l]  Vas represents the volume of air that when compressed to one cubic meter exerts the same force as the compliance (Cms) of the suspension in a particular speaker
  Sd: number, //[cm2]   the actual surface area of the cone
  BL: number, // [Tm]   the motor strength of a speaker
  Pmax: number, // [W]
  Xmax: number, // [mm]  Voice Coil Overhang of the driver. Maximum Linear Excursion
  Beta: number | '', //
  Z1k: number | '', // [ohm]
  Z10k: number | '', // [ohm]
  Le: number | '', // [mH]   the voice coil inductance
  Leb: number, // [mH]   the voice coil inductance
  Ke: number | '', // [sH]
  Rss: number | '', // [ohm]
  USPL: number, //
  BL_Re: number, //
  revision: string,	//
  updated: string, //date
  Lnom: number, //
  IP: string, //
  Range: 'Compression' | 'Tweeter' | 'Woofer' | 'Fullrange' | 'Subwoofer' | 'Micro',
  impedance: number, //
  power: number,//W
  Lm: number,
}

export interface Response {
  f: number[],
  dBmag: number[],
  Pmax: number[],
  SPLMax: number[],
  SPLTher: number[],
}

export type DriverResponse = {driver: Driver, response: Response};

export type DriverTableCell = {
  text: string,
  element?: any,
  exportable: boolean,
  style?: any,
  onClick?: (() => void)
}
export type DriverTableRow = {driver: Driver} & {cells: Array<DriverTableCell>};

export type Named = {
  name: string,
  editing: boolean,
  ported: boolean,
  Vb: number,
  Fb: number,
  nDrivers: number,
}

export type DriverResponseNamed = DriverResponse & Named;
type DriverResponseStyle = DriverResponse & {color: any};
export type DriverResponseStyleNamed = DriverResponseStyle & Named;