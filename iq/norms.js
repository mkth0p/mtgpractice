/* Open adult norms for the few tasks whose score does not depend on the items (longest span, median
   correct response time). Sources and the reasoning are in research/iq-training/open-norms.md.
   Everything else on the site has no open norms that transfer to generated items, so it gets none. */
(function () {
  "use strict";
  const N = {};

  // standard normal CDF (Abramowitz-Stegun 7.1.26 erf, error < 1.5e-7) and its inverse (Acklam)
  const Phi = z => { const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2); return z >= 0 ? (1 + y) / 2 : (1 - y) / 2; };
  const PhiInv = p => {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const q = Math.min(p, 1 - p);
    let x;
    if (q < 0.02425) { const r = Math.sqrt(-2 * Math.log(q)); x = (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1); }
    else { const r = (q - 0.5) * (q - 0.5); x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * (q - 0.5) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    return p < 0.5 ? -Math.abs(x) : Math.abs(x);
  };
  N.Phi = Phi; N.PhiInv = PhiInv;

  /* One entry per task that has usable open norms.
     retest: test-retest r from the source, used for the measurement error of one session.
     transfer: extra error (in SD) for the differences between the source's format and this site's. */
  N.TABLE = {
    dsf: {
      name: "Digits Forward", metric: "longest", unit: "digits", higherBetter: true, discrete: true,
      mean: 6.35, sd: 1.15, ceiling: 9, n: 763, ages: [18, 65], retest: 0.39, transfer: 0.35,
      source: "Woods et al. 2011, J Clin Exp Neuropsychol 33:101-111, Exp. 2 (longest list before two misses at one length; ages 18 to 65, New Zealand community sample)",
      caveat: "The source read the digits aloud at one per second; here they are shown on screen (turn on reading aloud in Settings to get closer). Woods found no age effect on forward span up to 65.",
    },
    dsb: {
      name: "Digits Backward", metric: "longest", unit: "digits", higherBetter: true, discrete: true,
      mean: 4.61, sd: 1.22, ceiling: 8, n: 763, ages: [18, 65], retest: 0.67, transfer: 0.35,
      source: "Woods et al. 2011, J Clin Exp Neuropsychol 33:101-111, Exp. 2 (same sample and stop rule)",
      caveat: "Spoken digits in the source, shown here. Backward span drops slightly with age (r about -.13).",
    },
    dsm: {
      name: "Digit Symbol Matching", metric: "medianRtc", unit: "ms", higherBetter: false, discrete: false,
      mean: 1360, sd: 354.7, n: 17507, ages: [18, 80], retest: null, transfer: 0.15,
      byDevice: { windows: [1407.7, 377.7], mac: [1342.3, 302.3], iphone: [1418.3, 290.7], android: [1494.4, 333.2], ipad: [1522.9, 335.7] },
      source: "Passell et al. 2021, Behav Res Methods 53:2544-2557 (TestMyBrain Digit Symbol Matching, median correct response time; ages 18 to 80, mean 35.9, web)",
      caveat: "The source sample was tested at home on the web, like you. It has a strong age effect that the published mean does not split by age, so the result is fairest between about 25 and 45.",
    },
  };
  N.IDS = Object.keys(N.TABLE);
  // assumed values (not from a source): stated as assumptions on the Method page
  N.ASSUMED_RETEST = 0.7;   // for a task whose source gives no retest r
  N.ASSUMED_R = 0.45;       // average correlation between these tasks, for the composite

  N.device = () => {
    const u = (typeof navigator !== "undefined" && navigator.userAgent) || "";
    if (/iPad/.test(u) || (/Macintosh/.test(u) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1)) return "ipad";
    if (/iPhone|iPod/.test(u)) return "iphone";
    if (/Android/.test(u)) return "android";
    if (/Mac OS X|Macintosh/.test(u)) return "mac";
    if (/Windows/.test(u)) return "windows";
    return null;
  };

  /* Score one standard-test session. Returns null for tasks without open norms. */
  N.score = (sess, age) => {
    const T = N.TABLE[sess.task];
    if (!T || sess.mode !== "test" || !sess.result) return null;
    const x = sess.result[T.metric];
    if (typeof x !== "number" || !isFinite(x) || x <= 0) return null;
    let mean = T.mean, sd = T.sd, normNote = "";
    const dev = sess.device;
    if (T.byDevice && dev && T.byDevice[dev]) { [mean, sd] = T.byDevice[dev]; normNote = `norms for ${dev === "iphone" ? "iPhone" : dev === "ipad" ? "iPad" : dev[0].toUpperCase() + dev.slice(1)}`; }
    let z;
    if (T.discrete) {
      // mid-p: half of the people with exactly this span count as below it
      const hi = Phi((x + 0.5 - mean) / sd), lo = Phi((x - 0.5 - mean) / sd);
      z = PhiInv((hi + lo) / 2);
    } else z = T.higherBetter ? (x - mean) / sd : (mean - x) / sd;
    const top = sess.result.ceiling || T.ceiling, atMax = top != null && x >= top; // a span at the top length is only a lower bound
    const r = T.retest || N.ASSUMED_RETEST;
    const err = Math.sqrt((1 - r) + T.transfer * T.transfer); // in SD units
    const warn = [];
    if (age == null) warn.push("no age set");
    else if (age < T.ages[0] || age > T.ages[1]) warn.push(`age outside the norm sample (${T.ages[0]} to ${T.ages[1]})`);
    return { task: sess.task, name: T.name, x, unit: T.unit, z, err, atMax: !!atMax, pct: 100 * Phi(z), iq: 100 + 15 * z, lo: 100 + 15 * (z - 1.645 * err), hi: 100 + 15 * (z + 1.645 * err), source: T.source, caveat: T.caveat, normNote, warn, retestAssumed: !T.retest };
  };

  /* Combine scored tasks (one per task) into one composite on the IQ scale.
     z_c = sum(z) / sqrt(k + k(k-1)r), the usual composite of correlated standard scores. */
  N.composite = scores => {
    const s = scores.filter(Boolean);
    if (!s.length) return null;
    const k = s.length, D = k + k * (k - 1) * N.ASSUMED_R;
    const z = s.reduce((a, x) => a + x.z, 0) / Math.sqrt(D);
    const err = Math.sqrt(s.reduce((a, x) => a + x.err * x.err, 0) / D);
    return { k, tasks: s.map(x => x.task), z, err, iq: 100 + 15 * z, lo: 100 + 15 * (z - 1.645 * err), hi: 100 + 15 * (z + 1.645 * err), lowerBound: s.some(x => x.atMax), complete: k === N.IDS.length };
  };

  if (typeof window !== "undefined") window.IQNORMS = N;
  if (typeof module !== "undefined" && module.exports) module.exports = N;
})();
