# Open normative data for WAIS-style practice tasks

Compiled 2026-10-18. This covers open, published adult reference data that can turn raw scores from the site's original-item tasks into approximate percentiles. Every number below comes from the source linked next to it. "Unconfirmed" means I could not reach a primary source for the value. Derived values are my own arithmetic and are labelled **[derived]**.

**Ground rules**

- Wechsler raw-to-scaled tables are Pearson's property, and none of them is reproduced here.
- Where a paper reports a Wechsler-sample *mean/SD* for a summary measure (for example, longest span), I quote that published summary with its citation. It is not a norm table.
- Access note: PubMed/PMC served a CAPTCHA to the fetch tool throughout. Papers available only on PMC (Singh et al. 2021 TestMyBrain toolkit; Carlozzi et al. 2015 NIH Toolbox Pattern Comparison norms; Lyall et al. tables S2/S3) could not be read. Their values are marked unconfirmed.

---

## 0. Executive answer

Only a few measures transfer reasonably across item content:

- **Span length:** longest digit span forward/backward, and Corsi-type spatial span.
- **Speed rate:** digit-symbol matches per unit time, or median RT per item.

For these, open large-sample data exist (UK Biobank, Woods et al., NHANES, TestMyBrain). Everything whose score depends on the specific item set has no open norms that transfer to newly generated items: matrix total score, arithmetic, LNS total, running span, symbol span, spatial addition, and digit-span *total trials correct*. For those, the honest route is to build sample-based norms and IRT-calibrate the generated items (§8).

There is no legitimate public source of WAIS-IV/WAIS-5 raw-to-scaled tables. Those tables are in the Pearson Administration and Scoring Manual and the Technical and Interpretive Manual, both sold under licence. Pearson's public "sample score reports" show scaled scores for a fictional examinee, not conversion tables ([WAIS-IV score report sample](https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/wais-iv/wais-iv-score-report.pdf)). Online "WAIS norm table" PDFs are leaked copies and must not be used.

---

## 1. Digit span (forward, backward, sequencing)

### 1a. Ready-to-code reference values

| # | Measure (definition) | Age band | n | Mean | SD | Percentiles | Administration | Source |
|---|---|---|---|---|---|---|---|---|
| D1 | **UKB Numeric Memory**: max digits recalled correctly. Starts at 2 digits and goes up by 1 until the first error (max 12) | 40–69 at recruitment (cohort mean age 56.44, SD 8.10) | 48,335 | **6.70** | **1.34** | n/a | UK, touchscreen; the number is shown on screen, then recalled after a brief pause | Lyall et al. 2016, *PLoS ONE* 11:e0154222, Table 1 ([PDF](https://eprints.gla.ac.uk/118856/1/118856.PDF)) |
| D2 | Same, UKB showcase field 4282, instance 0 (2006–10) | instance-0 ages: mean 56.53, SD 8.09, range 37–73 ([field 21003](https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=21003)) | 51,757 | 6.685 | 1.345 | all instances pooled (n=91,199): D1=5, D2–D4=6, median 7, D6–D7=7, D8–D9=8 | UK, touchscreen | [UKB field 4282](https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=4282) |
| D3 | Same, instance 2 (imaging, 2014+) | mean 66.47, SD 7.85, range 44–87 | 43,149 | 6.720 | 1.286 | as above | UK, touchscreen | [UKB field 4282](https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=4282) |
| D4 | **UKB Numeric Memory, online version** (field 20240) | UKB cohort at online follow-up; exact ages unconfirmed (roughly 45–80) | 110,911 | **6.92** | **1.49** | deciles 5, 6, 6, 7, 7(median), 7, 8, 8, 9 | UK, home web browser | [UKB field 20240](https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=20240) |
| D5 | **Woods et al. "TE-ML" forward**: longest list before two successive misses at the same length (≈ WAIS LDSF) | 18–65 (mean 46.5), education 12.5 y | 763 tested | **6.35** | **1.15** | MS cutoff for abnormal forward = 5.08; TE-ML cutoff = 4 | New Zealand community; computerized, recorded **spoken** digits at 1/s; examiner typed the response; 1:2 staircase, 10 trials, start at 5 digits | Woods et al. 2011, *J Clin Exp Neuropsychol* 33(1):101–111, doi:10.1080/13803395.2010.493149, Exp. 2 ([full text](https://www.academia.edu/5926107/Improving_digit_span_assessment_of_short_term_verbal_memory)) |
| D6 | Woods TE-ML **backward** (≈ LDSB) | same | same | **4.61** | **1.22** | — | same; backward started at 4 | same |
| D7 | Woods ML (longest correct on any trial), F / B | same | same | 6.77 / 5.19 | 1.03 / 1.09 | — | same | same |
| D8 | Woods mean span (MS, 50%-correct span), F / B | same | same | 6.52 / 4.91 | 1.00 / 1.06 | — | same | same |
| D9 | Woods TE-ML F / B, young | 18–46 (mean 26), education 14.8 y | 30 (3 sessions) | 7.36 / 5.80 | 0.88 / 1.42 | — | US (VA N. California); same auditory method, 14 trials | same, Exp. 1 |
| D10 | WMS-III standardization LDSF / LDSB, ages 20–29, **as quoted by Woods** | 20–29 | not stated | 6.74 / 5.07 | 1.31 / 1.57 | — | US, examiner reads digits aloud | Woods et al. 2011 (above), cited summary |
| D11 | **Forward-span longest length** (max length with ≥2 of 3 series correct) | 35–44 | 182 | 5.62 | 0.94 | — | Spain (Madrid), read aloud at 1/s; only primary and secondary education (university graduates excluded) | Sebastián & Mediavilla 2015, *Psicothema* 27(2):93–98 ([PDF](https://www.psicothema.com/pdf/4240.pdf)) |
| | | 45–54 | 225 | 5.52 | 0.94 | | | |
| | | 55–64 | 141 | 5.38 | 0.93 | | | |
| | | 65–69 | 48 | 4.88 | 0.93 | | | |
| | | 70–74 | 76 | 4.92 | 0.96 | | | |
| | | 75–79 | 57 | 4.67 | 0.66 | | | |
| | | 80–84 | 138 | 4.45 | 0.81 | | | |
| | | 85–90 | 120 | 4.25 | 0.74 | | | |
| D12 | US WAIS-IV LDSF **as reported in Sebastián & Mediavilla Table 2**. Table alignment is ambiguous, so use with caution | 35–44 / 45–54 / 55–64 | not stated | 6.8 / 6.8 / 6.5 | 1.4 / 1.4 / 1.3 | — | US, read aloud | same paper, Table 2 |
| D13 | Digit span **sequencing** (LDSS or DSS total) | — | — | **unconfirmed: no open adult norms found** | — | — | — | — |
| D14 | Digit span **total trials correct** | — | — | **unconfirmed**. Totals depend on trial count and discontinue rule, so no open totals transfer | — | — | — | — |

**Supporting facts**

- Woods Exp. 2 forward–backward difference: mean 1.7 digits (SD 1.3). Woods cites WMS-III values of 1.6 (ages 18–20) to 1.8 (ages 55–65).
- Woods age effects over 18–65: forward metrics did not correlate with age. Backward metrics correlated only weakly (r = −.13 to −.14). Education correlated r = .11 to .20.
- Woods test–retest reliability: forward TE-ML r = .39 and ML r = .68; backward TE-ML r = .67 and MS r = .84. The longest-span metric is noisy for a single session, which is relevant to how meaningful a site percentile can be.
- UKB Numeric Memory vs. WAIS-IV Digit Span in 160 Edinburgh adults aged 40–80: Forward r = .43, Backward r = .51, Sequencing r = .42. Test–retest over 4 weeks: r = .50 (n = 52). In that study the digits were "presented on the screen at once" ([Fawns-Ritchie & Deary 2020, *PLoS ONE*](https://www.pure.ed.ac.uk/ws/portalfiles/portal/145499094/FawnsRitchieDearyPONE2020ReliabilityAndValidity.pdf)). So UKB is a *visual, simultaneous* display with a one-error stop, which is not identical to the site's sequential 1/s display.
- **TestMyBrain Forward Digit Span** matches the site's format closely:
  - visual digits, 1000 ms each
  - typed on a keypad
  - 2 trials per length from 2 to 11; stop when both trials at a length fail
  - score = highest length with at most 1 error
  
  Source: [TEDS data dictionary](https://datadictionary.teds.ac.uk/pdfs/26yr/26yr_catslife_remembering_numbers.pdf). TMB reports N > 27,000 forward and N > 10,000 backward, but the public test list gives no means or SDs ([TMB test list](https://www.testmybrain.org/documents/TestMyBrainTestList.pdf)). Age norms appear in Singh et al. 2021 (*J Clin Exp Neuropsychol*, PMID 34907842), which I could not read. **unconfirmed.**
- Hartshorne & Germine 2015 (*Psychol Sci*) report that online "numerical working memory" peaks in the early-to-mid 30s and digit-symbol coding peaks around 18. The figures are curves without tabled means ([BPS summary](https://bps.org.uk/research-digest/different-mental-abilities-peak-different-times-life-18-70)).

### 1b. Visual vs. auditory presentation

- Auditory lists generally give a slightly *larger* span than visual lists. This is the modality effect (Drewnowski & Murdock 1980, cited at [Wikipedia: Memory span](https://en.wikipedia.org/wiki/Memory_span)). I found no open adult study that quantifies the digit-span difference under the site's exact format, so the size of the effect is **unconfirmed**.
- Indirect evidence suggests it is small. Woods' auditory TE-ML forward was 6.35 (ages 18–65). UKB visual numeric memory was 6.70–6.92 (ages ~40–80) despite its one-error stop. Neither number suggests a large visual penalty, but the samples differ, so this is not a controlled comparison.
- Practical rule: treat visual/keypad spans as roughly equivalent to auditory ones, and carry ±0.3 digits of extra uncertainty **[judgment, not a sourced number]**.

### 1c. Definitions to align in code

| Site metric | Closest open analogue | Note |
|---|---|---|
| LDSF (longest length with ≥1 of 2 trials correct; stop after 2 failures) | Woods TE-ML; TMB "span" | Same logic |
| Longest correct on any trial | Woods ML; UKB numeric memory (single attempt per length) | UKB stops at the first error, which biases it slightly low compared with a two-trial rule |
| Mean span (50% point) | Woods MS | Most reliable metric |

---

## 2. Letter–Number Sequencing (LNS)

| Measure | Age | n | Mean | SD | Admin | Source |
|---|---|---|---|---|---|---|
| WAIS-III LNS items, **oral**, monolinguals; total correct out of 21 | 17–23 | 30 | 11.10 | 2.31 | US university; examiner read at ~1 s/char; spoken response | Mielicki, Koppel, Valencia & Wiley 2018, *Appl Cogn Psychol* 32:805–814, doi:10.1002/acp.3468, Exp. 1 ([full text](https://www.academia.edu/47957787/Measuring_working_memory_capacity_with_the_letter_number_sequencing_task_Advantages_of_visual_administration)) |
| WAIS-III LNS, **visual** (700 ms per char + 300 ms blank, typed response), monolinguals, out of 21 | 17–21 | 30 | **11.30** | **2.68** | as above | same, Exp. 2 |
| WAIS-IV-based 30-item list, oral vs. visual, monolinguals, out of 30 | 18–23 | 32 | 18.00 oral / 17.94 visual | 2.11 / 2.72 | within-subject | same, Exp. 3 |
| NEURONORMA young adults: LNS span and total (range 0–7 and 0–21) | 18–49 | 179 | not reported (scaled-score tables only) | — | Spain | Tamayo et al. 2012, *Neurología* 27:319–329 ([PDF](https://www.elsevier.es/en-revista-neurologia-english-edition--495-pdf-download-S2173580812001137)) |
| Crowe 2000 (*Assessment*); Haut et al. | — | — | **unconfirmed (not retrieved)** | | | |

Visual and oral administration gave equivalent totals for monolinguals (Exp. 3: t(31) = 0.11, p = .91). Visual LNS correlated more strongly with Math ACT (r = .31 vs .16).

---

## 3. Running span, symbol span / visual span, spatial addition

| Measure | Age | n | Mean | SD | Admin | Source |
|---|---|---|---|---|---|---|
| Running letter span, 2,000 ms/item, partial-recall trials, strict serial scoring (max 99) | 18–35 (mean 23.6) | 88 | 43.49 | 19.13 (α .864) | Atlanta, USA; visual letters; targets 3–8, report last n | Broadway & Engle 2010, *Behav Res Methods* 42:563–570, doi:10.3758/BRM.42.2.563 ([PDF](https://englelab.gatech.edu/articles/2010/broadway-engle-2010.pdf)) |
| Same, 500 ms/item | same | 88 | 33.91 | 17.24 | same | same |
| Running span, 2,500 ms/item, "independent" lists 9–11 items, targets 3–6 (max 54), precue / postcue | 18–35 (mean 23.9) | 143 | 32.80 / 31.55 | 11.16 / 12.06 | same | same, Exp. 2 |
| **eCorsi** (tablet Corsi) forward span / backward span | 18–~70 (mean 32.3) | 107 | **5.68 / 4.99** | 1.13 / 1.31 | iPad; 500 ms flash, 1 s inter-onset | Brunetti, Del Gatto & Delogu 2014, *Front Psychol* 5:939, doi:10.3389/fpsyg.2014.00939 ([PDF](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00939/pdf)) |
| eCorsi forward span, young / older | young mean 21.6; older mean 57.6 | 73 / 34 | 6.11 / 4.76 | 0.80 / 1.19 | same | same |
| eCorsi total correct, F / B | all | 107 | 8.18 / 6.75 | 2.09 / 2.31 | same | same |
| Monaco et al. 2013 Corsi + digit span (Italian), n = 362, ages 20–90 | — | 362 | means not in abstract (age/education correction grids, paywalled) — **unconfirmed** | | Italy | *Neurol Sci* 34:749–754, doi:10.1007/s10072-012-1130-x ([record](https://art.torvergata.it/handle/2108/67271)) |
| Symbol span (WMS-IV) | — | — | no open norms (proprietary) | | | — |
| Spatial addition (WMS-IV) | — | — | no open norms found | | | — |

---

## 4. Digit-symbol substitution / coding and speed tasks

| # | Measure | Age | n | Mean | SD | Percentiles | Admin | Source |
|---|---|---|---|---|---|---|---|---|
| S1 | **UKB Symbol Digit Substitution**: correct matches in **60 s**, instance 2 | mean 66.47, SD 7.85, range 44–87 | 81,588 | **18.47** | **5.28** | all-instance deciles: 12, 14, 16, 17, 19 (median), 20, 22, 23, 25; range 0–38 | UK; on-screen key; digits selected on an on-screen number pad; practice first; "ONE MINUTE" | [UKB field 23324](https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=23324); [procedure](https://biobank.ndph.ox.ac.uk/ukb/ukb/docs/SymbolDigitSubstitution.pdf) |
| S2 | same, instance 3 | mean 68.79 | 19,772 | 18.74 | 5.24 | — | same | same |
| S3 | UKB SDS, Edinburgh validation (retest subsample, T1) | mean 61.7 | 52 | 18.85 | 5.63 | r(SDMT) = .64; retest r = .58 | same | Fawns-Ritchie & Deary 2020 |
| S4 | **NHANES DSST** (WAIS-III paper Digit Symbol–Coding, **120 s**, symbols written) | 60–69 | 1,628 | **57.1** | n/a | P25 46.3 / P50 57.9 / P75 67.5 | US national, in-person, paper | Brody et al. 2019, *NHSR* No. 126 ([PDF](https://stacks.cdc.gov/view/cdc/81519/cdc_81519_DS1.pdf)) |
| | | 70–79 | 894 | 47.9 | | 37.9 / 48.3 / 58.2 | | |
| | | 80+ | 492 | 39.9 | | 29.1 / 39.6 / 49.4 | | |
| | | all 60+ | 3,014 | 51.8 | | 40.0 / 52.3 / 63.4 | | |
| S5 | **TestMyBrain Digit Symbol Matching** (90 s; touch or key digit 1–3): **median correct RT** per participant | 18–80 (mean 35.9) | 17,507 | **1360 ms** | **354.7 ms** | by device: Windows 1407.7 (377.7), Mac 1342.3 (302.3), iPhone 1418.3 (290.7), Android 1494.4 (333.2), iPad 1522.9 (335.7) | Web, unproctored | Passell et al. 2021, *Behav Res Methods* 53:2544–2557, doi:10.3758/s13428-021-01597-3 ([PDF](https://rutter.lab.indiana.edu/files/folder/passell2021_behaviorresearchmethods.pdf)); procedure in [TEDS doc](https://datadictionary.teds.ac.uk/pdfs/26yr/26yr_catslife_digit_symbol_matching.pdf) |
| S6 | NIH Toolbox Pattern Comparison (symbol-search-like), n = 4,859, ages 3–85 | — | 4,859 | **unconfirmed** (tables paywalled) | | | iPad | Carlozzi et al. 2015, *Arch Clin Neuropsychol* 30:359–368, doi:10.1093/arclin/acv031 |

**Notes**

- Device effects on TMB DSM are about 0.1–0.2 SD; Android is slowest. The site should log device type and keep one device class per norm.
- UKB warns that guessing "1" repeatedly inflates the SDS count. Correct matches should be read together with attempted matches (field 6774).
- **Rate conversion.** UKB's 18.47 correct per 60 s is 0.31 per second **[derived]**. It cannot be rescaled linearly to 90 s or 120 s and compared with paper Coding: response mode (tap a digit vs. draw a symbol), key size and fatigue all change the rate. Use UKB values only if the site's task is also 60 s with on-screen keypad selection. Otherwise compare median correct RT with TMB (S5).

---

## 5. Timed mental arithmetic word problems

I found no open adult norms for timed orally or visually presented arithmetic word problems that are independent of item content. Arithmetic scores depend heavily on the items: operations, carrying, number of steps and time limits. **Verdict: not transferable; build local norms.**

---

## 6. Matrix reasoning

### 6a. Test-level open data (none transfer to generated items as total scores)

| Measure | Age | n | Mean | SD | Admin | Source |
|---|---|---|---|---|---|---|
| ICAR Matrix Reasoning, 11 items: mean proportion correct per item | 14–90 (mean 26, median 22), 78% US | 96,958 | 0.52 | 0.15 (across items) | Web, untimed, unproctored, matrix-sampled | Condon & Revelle 2014, *Intelligence* 43:52–64, doi:10.1016/j.intell.2014.01.004 ([PDF](https://personality-project.org/revelle/publications/condon.icar.14.pdf)) |
| ICAR MR item p-values: MR.43 .77, .44 .66, .45 .52, .46 .60, .47 .62, .48 .53, .50 .28, .53 .61, .54 .39, .55 .36, .56 .40 | same | 17k–35k per item | — | — | same | same, Table 2 |
| ICAR16 total: expected mean = sum of item p's **7.89 / 16 [derived]**; SD 1.86 as printed (Table 12; looks small, verify) | same | same | — | — | same | same |
| ICAR reliability: ICAR16 α .81; MR-11 α .68; ICAR16–Shipley-2 r .41 raw / .82 corrected | | | | | | same |
| SAPA trend: matrix reasoning drift −0.009 SD/year (2006–2018) | 18–90 | 394,378 | (standardized) | | US web | Dworak, Revelle & Condon 2023, *Intelligence* 98:101734 ([PDF](https://personality-project.org/revelle/publications/dworak.23.pdf)) |
| **MaRs-IB** accuracy, adults (80-item bank, 8 min, ≤30 s per item, 4 options) | 18–33 | 106 | **81%** (s.e. 1) | ≈10 **[derived from s.e.]** | London, supervised group computer testing; median correct RT 9,454 ms; split-half .80; retest r .71 | Chierchia et al. 2019, *R Soc Open Sci* 6:190232 ([PDF](https://discovery.ucl.ac.uk/id/eprint/10085176/1/Blakemore_The%20matrix%20reasoning%20item%20bank%20%28MaRs-IB%29_VoR.pdf)) |
| Raven APM Set II (36 items) | 17–63 (mean 28.1) | 369 | 14.79 | 6.48 | Brazil, university students | Rosseti et al. 2009, *Psico-USF* 14:177–184 ([PDF](https://www.redalyc.org/pdf/4010/401036074006.pdf)) |
| Graph Mapping (non-matrix Gf), proportion correct | 18–35 | 229 | 0.65 | 0.16 | Poland, lab | Jastrzębski et al. 2022, *Behav Res Methods* ([PDF](https://d-nb.info/1261693027/34)) |
| Bors & Stokes 1998 APM-12; Arthur & Day 1994; Hamel & Schmittmann 2006 (20-min APM, *EPM* 66:1039) | — | — | **unconfirmed (full texts not retrieved)** | | | |
| HMT-S (6 items): α .62; r = .79 with full HMT | — | — | means not retrieved | | free online | Heydasch, Haubrich & Renner 2013, *mda* 7:183–208, doi:10.12758/mda.2013.011 |

### 6b. Item difficulty vs. rule count (usable for generated items)

| Problem type | % correct | Sample | Source |
|---|---|---|---|
| Sandia 1-relation | 86.7 (SE 2.1) | 80 NMSU undergrads, mean age 20, computer, self-paced | Matzen et al. 2010, *Behav Res Methods* 42:525–541, doi:10.3758/BRM.42.2.525 ([text](https://www.academia.edu/11021421/Recreating_Raven_s_Software_for_systematically_generating_large_numbers_of_Raven_like_matrix_problems_with_normed_properties)); generator + data: [github.com/sandialabs/Matrices](https://github.com/sandialabs/Matrices) |
| Sandia 2-relation | 74.5 (2.1) | same | same |
| Sandia 3-relation | 54.8 (2.0) | same | same |
| 3-relation with 1 / 2 / 3 diagonal-or-outward relations | 74.0 / 53.0 / 47.0 | same | same |
| Sandia logic (AND / OR / XOR) | 37.9 overall (33.8 / 46.3 / 33.8) | same | same |
| 1-relation by direction: horizontal / vertical / diagonal / outward | 95 / 93 / 88–89 / 66 | same | same |
| Raven APM, 1 rule token | error ≈16% | CMU/Pitt students, n = 12 and 22 | Carpenter, Just & Shell 1990, ONR Tech Rep. ([PDF](https://apps.dtic.mil/sti/pdfs/ADA221448.pdf)); *Psych Rev* 97:404 |
| Raven APM, 3–4 rule tokens | error ≈59% | same | same |
| Rule count explains error rate across 32 APM problems | R² = .57 | same | same |
| MaRs-IB: each added dimension lowers log-odds correct | b = −0.38 (s.e. .009) | n = 659, ages 11–33 | Chierchia et al. 2019 |

**Can these give expected accuracy per generated level?** Roughly, if the site's generator varies the same factors (number of relations, diagonal or outward direction, logic rules), and only as a *prior* for undergraduates. All of these samples are university students, who sit above the general-population mean by an amount that is unconfirmed. Convert each level's p to a Rasch difficulty under θ ~ N(0,1) for that population: b = −√(1.702² + 1) · Φ⁻¹(p) ≈ −1.974 · Φ⁻¹(p) **[derived, probit approximation]**. For example, 1-relation (p .867) gives b ≈ −2.2; 3-relation (p .548) gives b ≈ −0.24; logic (p .379) gives b ≈ +0.61. A user's θ estimated from those b values is relative to *undergraduates*. Re-estimate the values from the site's own data as soon as possible (§8).

---

## 7. Converting open means and SDs to percentiles legitimately

1. **z within the closest age band and modality.** z = (x − M_band)/SD_band; percentile = Φ(z); scaled-like = 10 + 3z; index-like = 100 + 15z. Report a band, not a point. With test–retest r ≈ .5–.7 (Woods; Fawns-Ritchie), SEM = SD·√(1−r), which is 0.7–0.8 SD for one session.
2. **Discrete scores (span 2–12).** Use a mid-p percentile: P(X < x) + ½P(X = x). Under normality this is Φ((x + 0.5 − M)/SD) − ½[Φ((x + 0.5 − M)/SD) − Φ((x − 0.5 − M)/SD)]. Where only deciles exist (UKB), interpolate between deciles. Don't extrapolate beyond the 5th–95th percentile.
3. **Small reference samples (n < 100).** Use Crawford & Howell's (1998) modified t: t = (x − M)/(SD·√((n+1)/n)), df = n − 1. The percentile is the t-distribution CDF (*Clin Neuropsychol* 12:482–486; [program page](https://homepages.abdn.ac.uk/j.crawford/pages/dept/SINGSPEC.HTM)).
4. **Restricted samples.** Undergraduate SDs are too small. Don't use them for general-population percentiles without a range-restriction correction, and label any such result "relative to university students".
5. **Base rates instead of z** for skewed or ceilinged measures (span, accuracy near 100%). Report "x% of the reference sample scored at or below this", using the empirical deciles (UKB).
6. **Linking or equating to an open test.** Have a subsample take both the site task and an open anchor: ICAR16 for reasoning, a TMB-like visual digit span for span. Then apply equipercentile or linear linking, and carry over the anchor's population norms. This is the only way to place generated-item scores on a population metric without Pearson tables.
7. **Build sample-based norms from the study's own baseline.** Record age, education, device and modality. Fit continuous norms with GAMLSS or cNORM (R package [cNORM](https://cran.r-project.org/web/packages/cNORM/)) instead of fixed bands. Use only the **first** session for norms, because practice effects (Woods: +0.30 digits forward and +0.45 backward on MS over sessions) would bias later sessions.
8. **IRT for generated items.** Calibrate a Rasch or 2PL model with item-feature covariates (LLTM: difficulty = Σ feature weights such as relation count, direction or logic rule). Each newly generated item then has a predicted difficulty. Scores become θ, which is comparable across item sets and convertible to percentiles of the baseline θ distribution. Seed the feature weights with §6b, then re-estimate.
9. **Wechsler tables.** No legitimate public source exists. Do not label site outputs as "WAIS scaled scores" or "IQ".

---

## 8. Comparability verdict per site task

| Site task | Verdict | Use | Why |
|---|---|---|---|
| Digit span forward: longest span | **Good / approximate** | UKB D1 (6.70 ± 1.34, ages 40–69) or D4 online (6.92 ± 1.49); Woods D5 (6.35 ± 1.15, 18–65); Sebastián D11 for ages 35–90 (auditory, Spanish, lower-education) | Score is item-independent. Woods shows little age effect up to 65. Remaining issues are modality and stop-rule differences (±~0.3–0.5 digit) |
| Digit span backward: longest span | **Approximate** | Woods D6 4.61 ± 1.22 (18–65); young D9 5.80 ± 1.42 (n = 30) | Only auditory open data; no large visual sample |
| Digit span sequencing | **Not transferable** | Build local norms | No open adult norms |
| Digit span total trials correct | **Not transferable** | Derive from longest span or use local norms | Depends on trial count and discontinue rule |
| Letter–number sequencing | **Approximate only if** the site uses the WAIS-III layout (7 lengths × 3 trials = 21) | Mielicki visual 11.30 ± 2.68 (n = 30, ages 17–21) | Tiny undergraduate sample; total depends on list structure |
| Running digits | **Not transferable** (approximate only if Broadway–Engle structure is copied) | — | Letters, a specific scoring maximum, small sample |
| Symbol span | **Not transferable** | — | Proprietary WMS-IV; no open analogue |
| Visual / spatial (Corsi-type) span | **Approximate** | eCorsi F 5.68 ± 1.13, B 4.99 ± 1.31; young F 6.11 ± 0.80 | Span is item-independent, but n = 107 |
| Spatial addition | **Not transferable** | — | No open data |
| Coding / digit-symbol | **Approximate** (60 s keypad: UKB ages ~45–87; RT metric: TMB ages 18–80; paper 120 s: NHANES 60+) | UKB 18.47 ± 5.28 per 60 s; TMB median RT 1360 ± 355 ms; NHANES 60–69 mean 57.1 (P25/50/75 46.3/57.9/67.5) | Rate depends on response mode, key and duration. Match format or use RT |
| Symbol search / visual search | **Not transferable** (NIH TB norms unconfirmed) | — | Item- and format-dependent |
| Arithmetic word problems | **Not transferable** | — | Item content dominates |
| Matrix reasoning (generated) | **Not transferable as totals; approximate per item** via rule-count priors | Sandia 1/2/3-relation 86.7/74.5/54.8%, logic 37.9%; MaRs-IB −0.38 logit per dimension; ICAR MR p̄ .52 | Total depends on items. Item-level priors come from undergraduates. Needs IRT calibration or ICAR16 linking |

---

## Sources (all retrieved 2026-10-18)

- Lyall et al. 2016 PLoS ONE: <https://eprints.gla.ac.uk/118856/1/118856.PDF>
- UK Biobank showcase fields 4282, 20240, 23324, 21003: <https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=4282>, <https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=20240>, <https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=23324>, <https://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=21003>; SDS procedure <https://biobank.ndph.ox.ac.uk/ukb/ukb/docs/SymbolDigitSubstitution.pdf>
- Fawns-Ritchie & Deary 2020: <https://www.pure.ed.ac.uk/ws/portalfiles/portal/145499094/FawnsRitchieDearyPONE2020ReliabilityAndValidity.pdf>
- Woods et al. 2011 (Improving digit span): <https://www.academia.edu/5926107/Improving_digit_span_assessment_of_short_term_verbal_memory>; Woods et al. 2011 (error patterns): <https://www.academia.edu/27568383/Computerized_analysis_of_error_patterns_in_digit_span_recall>
- Sebastián & Mediavilla 2015: <https://www.psicothema.com/pdf/4240.pdf>
- Monaco et al. 2013 record: <https://art.torvergata.it/handle/2108/67271>
- TMB: <https://www.testmybrain.org/documents/TestMyBrainTestList.pdf>, <https://datadictionary.teds.ac.uk/pdfs/26yr/26yr_catslife_remembering_numbers.pdf>, <https://datadictionary.teds.ac.uk/pdfs/26yr/26yr_catslife_digit_symbol_matching.pdf>
- Passell et al. 2021: <https://rutter.lab.indiana.edu/files/folder/passell2021_behaviorresearchmethods.pdf>
- Brody et al. 2019 NHANES: <https://stacks.cdc.gov/view/cdc/81519/cdc_81519_DS1.pdf>
- Mielicki et al. 2018: <https://www.academia.edu/47957787/Measuring_working_memory_capacity_with_the_letter_number_sequencing_task_Advantages_of_visual_administration>
- Tamayo et al. 2012: <https://www.elsevier.es/en-revista-neurologia-english-edition--495-pdf-download-S2173580812001137>
- Broadway & Engle 2010: <https://englelab.gatech.edu/articles/2010/broadway-engle-2010.pdf>
- Brunetti et al. 2014: <https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00939/pdf>
- Condon & Revelle 2014: <https://personality-project.org/revelle/publications/condon.icar.14.pdf>; Dworak et al. 2023: <https://personality-project.org/revelle/publications/dworak.23.pdf>
- Chierchia et al. 2019: <https://discovery.ucl.ac.uk/id/eprint/10085176/1/Blakemore_The%20matrix%20reasoning%20item%20bank%20%28MaRs-IB%29_VoR.pdf>
- Matzen et al. 2010: <https://www.academia.edu/11021421/Recreating_Raven_s_Software_for_systematically_generating_large_numbers_of_Raven_like_matrix_problems_with_normed_properties>; <https://github.com/sandialabs/Matrices>
- Carpenter, Just & Shell 1990: <https://apps.dtic.mil/sti/pdfs/ADA221448.pdf>
- Rosseti et al. 2009: <https://www.redalyc.org/pdf/4010/401036074006.pdf>
- Jastrzębski et al. 2022: <https://d-nb.info/1261693027/34>
- Heydasch et al. 2013: <https://majournals.bib.uni-mannheim.de/mda/article/view/2013.011>
- Crawford & Howell 1998: <https://homepages.abdn.ac.uk/j.crawford/pages/dept/SINGSPEC.HTM>
- cNORM: <https://cran.r-project.org/web/packages/cNORM/>
- Pearson WAIS-IV sample score report: <https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/wais-iv/wais-iv-score-report.pdf>
