import _tymphanyData from './tymphany.json';
import _otherData from './drivers.json';
import {Driver, Response, DriverResponse} from "../components/types";
const {log10, pow, PI, sqrt} = Math;

/*
•Enter the volume of the box (Vb) and Port Tuning Frequency (Fb)
•Enter target driver size (Sd)
•Simulate every driver in that database, which has an Sd within 20% of the target
•Generate a family of curves, and then  have check boxes to switch on/off curves, identifying visually anything with a good response

Vb volume of the box

Sd target driver size

Fb is port tuning frequency

F3 is the frequency where the simulated response is 3dB down from the broadband sensitivity
It describes the lower end of the effective frequency range
Some manufacturers use the 6dB down point instead
F3 shouldn't be an input, but an output I think
 */

const mapper = (d: any): Driver => ({
  id: d.id ?? 0,
  Brand: d.Brand,
  model: d.Model,
  type: d.Type,
  status: d.Status,
  size: d['Size [in]'] * 2.54, // [in] -> [cm]
  Re: d['Re [ohm]'], // [ohm]
  Fs: d['Fs [Hz]'], // [Hz]
  Qms: d.Qms,
  Qes: d.Qes,
  Qts: d.Qts,
  Rms: d['Rms [Ns/m]'], // [Ns/m]
  Mms: d['Mms [g]'] / 1000, // [kg]
  Cms: d['Cms [mm/N]'] / 1000, //[m/N]
  Vas: d['Vas [l]'], //[l]
  Sd: d['Sd [cm2]'], //[cm2]
  BL: d['BL [Tm]'], // [Tm]
  Pmax: d['Pmax [W]'], // [W]
  Xmax: d['Xmax [mm]'], // [mm]
  Beta: d.Beta, //
  Z1k: d['Z1k [ohm]'], // [ohm]
  Z10k: d['Z10k [ohm]'], // [ohm]
  Le: d['Le [mH]'], // [mH]
  Leb: d['Leb [mH]'], // [mH]
  Ke: d['Ke [sH]'], // [sH]
  Rss: d['Rss [ohm]'], // [ohm]
  USPL: d.USPL, //
  BL_Re: d['BL/Re'], //
  revision: d.Revision,	//
  updated: d.Updated, //date
  Lnom: d.Lnom, //
  IP: d.IP, //
  Range: d.Range,
  impedance: d.Impedance, //
  power: d.Power,//W
  Lm: d.Lm,
});

const tymphanyDrivers = _tymphanyData
  .map(mapper)
  .map(x => ({
    ...x,
    _source: 'Tymphany',
    Brand: 'Tymphany',
  })) as Array<Driver>;

const otherDrivers = _otherData
  .map(d => ({
    ...d,
    Brand: (d.Brand ?? '').trim(),
    Sd: d.Sd * 10000, //convert m^2 to cm^2
    Xmax: d.Xmax * 1000, //convert m to mm
    Vas: d.Vas * 1000, //convert m^3 to l
    impedance: d.Znom,
  })) as any as Array<Driver>;

const allDrivers = [...tymphanyDrivers, ...otherDrivers]
  .filter(d => d.status !== 'Discontinued')
  .map((d, id) => ({
    ...d,
    id,
  }));
  //.filter(d => d.Xmax !== 0);

/**
 * https://audiojudgement.com/thiele-small-parameters-equations/
 * */
export const derivedParams = (d: Driver) => {
  const {
    Cms, Mms, Sd, BL, Re, Qms: _Qms, Qes: _Qes
  } = d;
  /*{
  Cms: number, // m/N
  Mms: number, // kg
  Sd: number, // cm2
  BL: number, // Tm
  Re: number, // ohm voice coil resistance
  _Qms: number, // ohms: value from the DB
  _Qes: number // ohms: value from the DB
}) => {*/

  const numberValid = (n: number) => !isNaN(n) && isFinite(n) && n > 0;
  const canDeriveParams = numberValid(Cms) && numberValid(Mms) && numberValid(Sd) && numberValid(BL) && numberValid(Re) && numberValid(_Qms) && numberValid(_Qes);

  // Res = Z0 - Re;
  // Qms = Res / (pow(BL, 2) * Cms * 6.283 * Fs);
  // Qes = Re  / (pow(BL, 2) * Cms * 6.283 * Fs);
  // rearrange to get:
  const Z0 = Re * (1 + _Qms / _Qes); // ohm impedance peak measured at resonance

  const Cmms_mm = Cms * 1000;
  const Mms_g = Mms * 1000;
  const Fs = 50 * PI * Math.sqrt(1 / (Cmms_mm * Mms_g)); // this calc requires Cms in mm/N and Mms in g
  const Vas = 0.0014 * pow(Sd, 2) * Cmms_mm; // this calc requires Cms in mm/N
  const Res = Z0 - Re;
  const Qms = Res / (pow(BL, 2) * Cms * 6.283 * Fs); // this calc requires Cms in m/N
  const Qes = Re  / (pow(BL, 2) * Cms * 6.283 * Fs); // this calc requires Cms in m/N
  const Qts = (Qes * Qms) / (Qes + Qms);
  return {
    Fs, Vas, Qms, Qes, Qts, canDeriveParams
  }
}

const deriveParamsAndMerge = (d: Driver): Driver => {
  const {Fs, Vas, Qms, Qes, Qts, canDeriveParams} = derivedParams(d);
  if (!canDeriveParams) {
    return d;
  }

  return {
    ...d,
    Fs, Vas, Qms, Qes, Qts
  }
}

const doDriverConsistencyCheck = () => {
  allDrivers.forEach(d => {

    const {Fs, Vas, Qms, Qes, Qts,} = derivedParams(d);

    const compare = (a: number, b: number, params: string) => {
      if (isNaN(a) || isNaN(b)) {
        console.log(`NAN`, a, b, params);
      }
      const d = Math.abs(a - b);
      if (d / a > 0.05) {
        console.log("DIFF", a, b, d, params);
      }
    }

    console.log(d.Brand, d.model, {
      Cms: d.Cms * 1000,
      Mms: d.Mms * 1000,
      Sd: d.Sd,
      BL: d.BL,
      Re: d.Re,
      impedance: d.impedance,
    });
    compare(d.Fs, Fs, `${d.Brand} ${d.model} Fs`);
    compare(d.Vas, Vas, `${d.Brand} ${d.model} Vas`);
    compare(d.Qms, Qms, `${d.Brand} ${d.model} Qms`);
    compare(d.Qes, Qes, `${d.Brand} ${d.model} Qes`);
    compare(d.Qts, Qts, `${d.Brand} ${d.model} Qts`);
  })
}

//doDriverConsistencyCheck();

//console.log(allDrivers);

const Ql = 7; //box loss
//const k = 0.73; //port correction
//const Np = 1; //number of ports

interface Input {
  Fs: number, //hz
  Vas: number, //litres
  Qts0: number,
  Qes: number,
  Xmax: number, //mm
  Sdcm2: number, //cm2 cone area
  Vb: number,
  Fb: number,
  nDrivers: number,
  ported: boolean,
}

const factor = 1.03;
const F = [10];
while (F[F.length - 1] * factor < 1000) {
  F.push(F[F.length - 1] * factor);
}

export const getResponse = (params: Input): Response => {

  const {
    Fs, Vas, Qts0, Qes, Xmax, Sdcm2,
    Vb: _Vb, Fb, nDrivers, ported,
  } = params;

  const outputOffset = 10 * Math.log10(nDrivers);
  const Vb = _Vb / nDrivers;

  const n0 = 9.64 * pow(10, -10) * pow(Fs, 3) * Vas / Qes; // aka \Gno
  const SPL = 112 + 10 * log10(n0); //Snd pres 1W/m
  const Sd = Sdcm2 / 1e4;
  const Vd = Sd*Xmax / 1000;
  const c = 345; // speed of sound in air m/s
  const Ro = 1.18; // density of air (1.18 kg/m^3)

  if (ported) {

    const Qts = Qts0; // Re > 0 ? (Qts0 * (Re + Rvc)) / Re : Qts0;

    const PK1 = (4 * pow(PI, 3) * Ro / c) * pow(Fs, 4) * pow(Vd * 1.15, 2);
    const PK2 = 112 + 10 * log10(PK1);

    const _A = pow(Fb / Fs, 2);
    const _B = _A / Qts + Fb / (Ql * Fs);
    const _C = 1 + _A + (Vas / Vb) + Fb / (Fs * Qts * Ql);
    const _D = 1 / Qts + Fb / (Fs * Ql);
    const _E = (97 / 49) * _A;

    //console.log({n0, SPL, Qts, Sd, Vd, Vb, Fb})
    //console.log({Fs, Vas, Qts0, Qes, Xmax, Sdcm2, Vb, Fb, name})

    const response = (): Response => {

      const _Fn2 = F.map(f => pow(f / Fs, 2));
      const _Fn4 = _Fn2.map(f2 => pow(f2, 2));

      const dBmag = Array(F.length).fill(0).map((_, i) => {
        return outputOffset + 10 * log10(pow(_Fn4[i], 2) / (pow(_Fn4[i] - _C * _Fn2[i] + _A, 2) + _Fn2[i] * pow(_D * _Fn2[i] - _B, 2)));
      });

      const Pmax = Array(F.length).fill(0).map((_, i) => {
        return outputOffset +  (PK1 / n0) * (pow(_Fn4[i] - _C * _Fn2[i] + _A, 2) + _Fn2[i] * pow(_D * _Fn2[i] - _B, 2)) / (_Fn4[i] - _E * _Fn2[i] + pow(_A, 2))
      });

      const SPLMax = Array(F.length).fill(0).map((_, i) => {
        return outputOffset + PK2 + 10 * log10(pow(_Fn4[i], 2) / (_Fn4[i] - _E * _Fn2[i] + pow(_A, 2)));
      });

      const SPLTher = dBmag.map(m => SPL + m);

      return {
        f: F, dBmag, Pmax, SPLMax, SPLTher
      }

    }

    return response();
  } else {

    const Qb = sqrt(Vas / Vb + 1) * Qts0; //loudspeaker design cookbook
    const Fb = (Qb * Fs) / Qts0; //loudspeaker design cookbook

    const K1 = (4 * pow(PI, 3) * Ro / c) * pow(Fb, 4) * pow(Vd, 2);
    const PeakSPL = SPL + 10*log10(1);

    const K2 = 112+10*log10(K1)

    const response = (): Response => {

      //Frequency-dependent equations:
      const Fr = F.map(f => pow(f/Fb, 2));
      const dBmag = Fr.map(fr => outputOffset + 10*log10(pow(fr,2)/(pow(fr - 1, 2) + fr/pow(Qb, 2))));
      const Pmax = Fr.map(fr => outputOffset + K1*(pow(fr - 1, 2) + fr/pow(Qb,2))/n0);
      const SPLMax = F.map(f => outputOffset + K2 + 40*log10(f/Fb));
      const SPLTher = dBmag.map(dbm => PeakSPL + dbm);

      return {
        f: F, dBmag, Pmax, SPLMax, SPLTher
      }

    }

    return response();
  }

}

/*const getVbFb = ({Qts, Vas, Fs}: {Qts: number, Vas: number, Fs: number}) => {
  const Vb = 20 * pow(Qts, 3.3) * Vas; //m3
  const Fb = pow(Vas / Vb, 0.31) * Fs;
  return {
    Vb, Fb
  }
}*/

export const useDrivers = ({ Sd, filterDriversPercent}: {
  Sd: number,
  filterDriversPercent: number,
}): Array<Driver> => {

  const invalid = (n: number) => isNaN(n) || n === 0;

  if (invalid(Sd) || invalid(filterDriversPercent)) {
    return [];
  }

  return allDrivers
    .filter(d => (d.Sd / Sd < (1 + filterDriversPercent / 100)) && (Sd / d.Sd < (1 + filterDriversPercent / 100)))
    .reduce((arr, d) => {
      if (!arr.some(a => a.Brand === d.Brand && a.model === d.model)) {
        arr.push(d);
      }
      return arr;
    }, [] as Driver[]);

}

export const getImpedance = (driver: Driver): { f: number[], Z: number[] } | null => {
  const { Re, Fs, Qes, Qms } = driver;

  const numberValid = (n: number) => !isNaN(n) && isFinite(n) && n > 0;
  if (!numberValid(Re) || !numberValid(Fs) || !numberValid(Qes) || !numberValid(Qms)) {
    return null;
  }

const Z = F.map(f => {
    const fn = f / Fs;
    const fn2 = pow(fn, 2);
    const denom = pow(1 - fn2, 2) + pow(fn / Qms, 2);
    const num = pow(1 - fn2, 2) + pow(fn / Qes, 2);
    return Re * sqrt(num / denom);
  });

  return { f: F, Z };
}
