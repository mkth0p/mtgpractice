# Practice Effects, Training Transfer, and Design for a Before/After IQ-Practice Study

*Research brief for the paper "training on practice tasks modeled on adult IQ tests, with pre/post testing". Compiled 2026-10-18.*

**How to read this brief.** Every number below comes from a source retrieved during this review, and the URL or DOI is given next to it. Where a detail (page range, DOI, exact value) could not be checked against a retrieved source, it is marked **[unconfirmed]**. A few bibliographic details are recalled from the standard literature but were not seen in a retrieved page; those are marked **[citation details unconfirmed]** and should be checked before submission. Effect sizes are standardized mean differences (d, g, or SMCR) unless stated otherwise. On the IQ metric (SD = 15), d = 0.20 is about 3 points, d = 0.33 about 5 points, and d = 0.50 about 7.5 points.

---

## 0. Executive summary

| Phenomenon | Best estimate | Source |
|---|---|---|
| Retest gain, 1st→2nd administration, cognitive ability tests | SMCR = 0.33 [0.28, 0.38] (k = 122 studies, N = 153,185) | Scharfen, Peters & Holling (2018) |
| Retest gain, 1st→3rd / 1st→4th | 0.50 / 0.52; 3rd→4th gain 0.02 (n.s.), so gains plateau after about 3 sessions | Scharfen et al. (2018) |
| Retest gain, identical vs alternate forms | 0.37 vs 0.23 (1st→2nd) | Scharfen et al. (2018) |
| Practice effect in selection testing | δ = 0.26 overall (107 samples, N = 134,436); identical forms 0.46 vs alternate 0.24 | Hausknecht et al. (2007) |
| Practice **plus coaching** | δ = 0.70 (k = 23) vs 0.24 without coaching | Hausknecht et al. (2007) |
| WAIS FSIQ retest gain (about 1 month) | WAIS-IV +3.9 to +5.0 by age band; WAIS-5 +2.3 to +3.7 | Winter, Trudel & Kaufman (2024), from the test manuals |
| Index pattern (WISC-IV, 32-day retest) | FSIQ +5.6, VCI +2.1, WMI +2.6, PRI +5.2, PSI +7.1 | Williams, Weiss & Rolfhus (2003) |
| Correlation of retest gains with g loadings | r = −.80 observed; ρ ≈ −.95 corrected ("no g") | te Nijenhuis, van Vianen & van der Flier (2007) |
| n-back training → fluid intelligence | g = 0.24 overall; 0.44 with passive controls vs **0.06 with active controls** | Au et al. (2015) |
| WM training → nonverbal ability | g = 0.05 with treated controls vs 0.20 with untreated; about 0 at follow-up | Melby-Lervåg, Redick & Hulme (2016) |
| Far transfer across cognitive-training literatures | about 0 after controlling for placebo effects and publication bias | Sala et al. (2019) |
| Expectancy/placebo recruitment alone | Group × time d = 0.98 (RAPM), 1.34 (BOMAT) after 1 h of training | Foroughi et al. (2016) |
| Education (genuine, durable) | about 1–5 IQ points per additional year | Ritchie & Tucker-Drob (2018) |
| Flynn effect (for contrast) | about 2.8 FSIQ points per decade (fluid 4.1) | Pietschnig & Voracek (2015) |

**Bottom line for the paper.** A naive pre/post design with no control group should expect a gain of about 0.25–0.35 SD (4–5 IQ points) from retesting alone. On a matrix-type test this gain can grow to 0.5 SD or more if participants practice the *same item type* with explicit rule or strategy instruction (coaching δ ≈ 0.70). The literature consistently finds that such gains are test-specific, do not load on g, and largely vanish against well-matched active controls. The study must therefore separate three things: (a) retest effects, (b) item- and strategy-specific learning (near transfer), and (c) any change in the underlying ability (far transfer). Section 7 gives a concrete design.

---

## 1. Retest (practice) effects on cognitive and IQ tests

### 1.1 Meta-analytic estimates

**Scharfen, Peters & Holling (2018).** *Retest effects in cognitive ability tests: A meta-analysis.* Intelligence, 67, 44–66. https://doi.org/10.1016/j.intell.2018.01.003 (PDF: https://www.Gwern.net/doc/iq/2018-scharfen.pdf)

- 122 studies, 174 samples, 786 outcomes, N = 153,185. The metric is the standardized mean change with raw-score standardization (SMCR).
- 1st→2nd: **0.33** [0.28, 0.38]. 1st→3rd: **0.50** [0.41, 0.59]. 1st→4th: **0.52** [0.40, 0.63]. 2nd→3rd: 0.17. 3rd→4th: **0.02 (n.s.)**, which the authors read as a plateau after the third administration.
- **Form:** identical forms gave 0.37 and alternate forms 0.23 (1st→2nd). For 1st→3rd, the figures were 0.55 vs 0.35.
- **Interval:** longer intervals predicted smaller 1st→2nd effects, but only slightly (about −0.0008 SMCR per week).
- **Domain:** reasoning 0.33, processing speed 0.37, memory 0.28, divergent thinking 0.26 (1st→2nd). These differences were mostly not significant. By content, numerical (0.18) < verbal (0.33) < mixed/figural content (0.41).
- **Ability level** was **not** a significant moderator. **Age** mattered only at 3rd→4th (older samples gained less).

**Hausknecht, Halpert, Di Paolo & Moriarty Gerrard (2007).** *Retesting in selection: A meta-analysis of coaching and practice effects for tests of cognitive ability.* Journal of Applied Psychology, 92(2), 373–385 [volume/pages/DOI 10.1037/0021-9010.92.2.373 unconfirmed]. Preprint: https://ecommons.cornell.edu/server/api/core/bitstreams/4fbba765-0d9c-4940-8492-66fecaca5227/content

- 50 studies, 107 samples, N = 134,436. Corrected overall δ = **0.26** (sample-weighted d = 0.24) from Test 1 to Test 2.
- Test 2→3: δ = 0.20 (k = 16). Test 1→3: δ = 0.56 (k = 15).
- **Coaching:** δ = **0.70** (k = 23) vs 0.24 without coaching (k = 75). Coaching time was a significant predictor (β = .26).
- **Identical forms δ = 0.46** (k = 38) vs **alternate forms 0.24** (k = 64).
- **Interval:** for identical forms, gains decreased with longer intervals (β = −.51). The authors estimate that identical-form and alternate-form gains converge at about **685 days**.
- By ability dimension: analytical 0.32, quantitative 0.30, verbal 0.19 (differences n.s.). Research settings (0.24) and operational settings (0.29) did not differ significantly.

**Calamia, Markon & Tranel (2012).** *Scoring higher the second time around: Meta-analyses of practice effects in neuropsychological assessment.* The Clinical Neuropsychologist, 26(4), 543–570. https://doi.org/10.1080/13854046.2012.680913 (record: https://experts.umn.edu/en/publications/scoring-higher-the-second-time-around-meta-analyses-of-practice-e/)

- Nearly 1,600 effect sizes from common neuropsychological tests, including Wechsler subtests. The abstract defines practice effects as "score increases due to factors such as memory for specific test items".
- The size of the gain depended on **alternate-form use, age, clinical diagnosis, and retest interval**. Per-test effect sizes and the regression model are in the full text; specific values are **[unconfirmed]** in this review, so check the paper's tables before quoting per-domain numbers.

**Goldberg, Harvey, Wesnes, Snyder & Schneider (2015).** *Practice effects due to serial cognitive assessment: Implications for preclinical Alzheimer's disease randomized controlled trials.* Alzheimer's & Dementia: DADM, 1(1), 103–111. https://doi.org/10.1016/j.dadm.2014.11.003 (https://doaj.org/article/102a2a1dd120448ab7e9c1a394e47325)

- In cognitively unimpaired older adults tested three times over 6–12 months, composite practice effects are about **d = 0.25**.
- Recommended mitigations: massed pre-baseline practice (run-in), tests that resist strategy use, and well-matched alternate forms.

### 1.2 Coaching and practice studies (Kulik and successors)

- **Kulik, Bangert-Drowns & Kulik (1984)**, *Effectiveness of coaching for aptitude tests*, Psychological Bulletin, 95(2), 179–188 [citation details unconfirmed]. As summarized by Becker (1990, below), Kulik et al. reported coaching effects on SAT-type tests of 0.08 SD for 3–9-hour programs and 0.16 for programs over 9 hours. Randomized studies gave 0.21 and nonrandomized studies 0.12. Low-ability samples gained 0.20 and high-ability samples 0.06.
- **Kulik, Kulik & Bangert (1984)**, *Effects of practice on aptitude and achievement test scores*, American Educational Research Journal, 21, 435–447 [citation details unconfirmed]. This is the companion meta-analysis on simple practice, which reported larger gains on identical than on parallel forms. Its exact effect sizes are **[unconfirmed]**; the Hausknecht (2007) and Scharfen (2018) figures above supersede them.
- **Becker (1990)**, *Coaching for the Scholastic Aptitude Test: Further synthesis and appraisal*, Review of Educational Research, 60(3), 373–417 (https://www.Gwern.net/doc/statistics/causality/1990-baker.pdf). Coached groups exceeded controls by only 0.09 SD (SAT-V) and 0.16 SD (SAT-M) in published comparison studies. Across all 70 outcomes the average was 0.30 SD, which shows that uncontrolled designs overstate coaching. Becker also summarizes Messick & Jungeblut (1981): gains appear only after about 3 hours of coaching, with steeply diminishing returns.

**Design implication.** Coaching (explicit instruction about item types and solution rules) roughly **triples** the retest gain (0.70 vs 0.24). A practice regimen "modeled on adult IQ tests" is a form of coaching. The paper should therefore treat the expected pre/post gain in the training arm as **0.5–0.7 SD on the trained item format**, even with zero change in ability.

### 1.3 Wechsler manual data (WAIS-IV, WAIS-5, WISC-IV)

**Winter, Trudel & Kaufman (2024).** *Wait, where's the Flynn effect on the WAIS-5?* Journal of Intelligence, 12(11), 118. https://doi.org/10.3390/jintelligence12110118 (https://www.mdpi.com/2079-3200/12/11/118). Table 3 reproduces the manuals' FSIQ test–retest gains:

| Edition | Youngest band | Middle band | Older band | Oldest band |
|---|---|---|---|---|
| WAIS-III | +5.7 (16–29) | +5.1 (30–54) | +3.9 (55–74) | +3.2 (75–89) |
| WAIS-IV | +4.6 (16–29) | +4.4 (30–54) | +5.0 (55–69) | +3.9 (70–90) |
| WAIS-5 | +3.7 (16–34) | +3.7 (35–69) | — | +2.3 (70–90) |

- WAIS-5 test–retest sample: N = 201, ages 16–90 (mean 53), **mean interval 29 days**.
- WAIS-IV test–retest sample: N = 298, interval **8–82 days (mean 22 days)** (Canivez, 2010, Buros review: https://www.ux1.eiu.edu/~glcanivez/Adobe%20pdf/Publications-Papers/Canivez%20(2010)%20Buros%20MMY%20WAIS-IV%20Review.pdf). Canivez notes that WAIS-IV practice effects were largest for Perceptual Reasoning subtests (Block Design, Visual Puzzles, Figure Weights, Picture Completion). Gains were smaller for VCI and WMI than for PRI and PSI (Ray, 2009 summary: https://secure.in.gov/ipdc/files/Ethical-Implications-of-Practice-Effect.pdf).
- Winter et al. note that practice effects have shrunk across editions, that older adults still gain less, and that no formal numerical correction exists (unlike the conventional Flynn correction of about 3 points per decade). AAIDD and DSM-5-TR nonetheless require examiners to take practice effects into account. The paper also gives a general rule of thumb: nonverbal standard scores rise about 7–10 points on readministration, verbal scores 2–3, and FSIQ 5–8, without attributing these figures to a specific edition.
- **Index-level WAIS-IV and WAIS-5 retest gains are [unconfirmed]** (they appear in the Technical and Interpretive Manuals, which are not public). The commonly cited "about 4–5 FSIQ points, larger for PSI/PRI and smaller for VCI" is consistent with the confirmed data above.

**WISC-IV Technical Report #2** (Williams, Weiss & Rolfhus, 2003; N = 243, mean interval 32 days): https://www.gwern.net/docs/www/images.pearsonclinical.com/37ecde14d9336931f3cab9352a354f6e2e4dc053.pdf

| Composite | Time 1 | Time 2 | Gain | r12 | Standard difference |
|---|---|---|---|---|---|
| FSIQ | 101.0 | 106.6 | +5.6 | .89 | .46 |
| VCI | 100.0 | 102.1 | +2.1 | .89 | .18 |
| PRI | 100.7 | 105.9 | +5.2 | .85 | .39 |
| WMI | 99.8 | 102.4 | +2.6 | .85 | .20 |
| PSI | 102.4 | 109.5 | +7.1 | .79 | .51 |

This child-battery table shows the canonical pattern: **processing speed > perceptual/fluid > working memory ≈ verbal**.

**WAIS-III** (Ray, 2009): FSIQ +3.2 to +5.7, VIQ +2.0 to +3.2, PIQ +3.7 to +8.3 at about 35 days. Kaufman & Lichtenberger (2006) note that **Matrix Reasoning, Vocabulary and Comprehension show the smallest gains** (http://www.iqscorner.com/2011/01/iq-test-effects.html).

Estevis, Basso & Combs (2012, The Clinical Neuropsychologist) report WAIS-IV practice effects persisting at 3- and 6-month intervals (values [unconfirmed]).

### 1.4 Retest intervals in practice

- Clinical convention: "established clinical practice is to avoid administering the same intelligence test within the same year" (AAIDD, quoted at http://www.iqscorner.com/2011/01/iq-test-effects.html). Ray (2009) advises a different instrument if retesting within 6 months.
- Identical-form gains decay with time and converge with alternate-form gains at about 685 days (Hausknecht et al., 2007). The per-week decay is small (Scharfen et al., 2018). A 2–6-week pre/post interval, which is typical for training studies, therefore sits near the maximum retest effect. The remedy is a control group, not the interval.

### 1.5 Learning theory framing (Estes 1974)

Estes, W. K. (1974). *Learning theory and intelligence.* American Psychologist, 29(10), 740–749 [citation details unconfirmed]. Estes argued that intelligence-test performance should be analyzed as the product of learnable cognitive processes and strategies, which is the theoretical basis for expecting test-specific learning. Cite it as the classic statement that test scores are partly a product of learning on the test itself, not as an empirical effect size.

---

## 2. Are the gains "real"? Measurement invariance and g

### 2.1 The "hollow gains" result

**te Nijenhuis, van Vianen & van der Flier (2007).** *Score gains on g-loaded tests: No g.* Intelligence, 35, 283–300. https://doi.org/10.1016/j.intell.2006.07.006 (PDF: https://www.Gwern.net/doc/iq/2007-tenijenhuis.pdf)

- Meta-analysis of 64 test–retest studies (N = 26,990; Dutch, British and US batteries). The correlation between subtest g loadings and subtest retest gains was **r = −.80** (SD = .20). After corrections it was **ρ = −.95**, and −1.06 after a further construct-validity correction (they interpret this as −1.00 and note it is an overcorrection).
- In other words, the **more g-loaded a subtest, the less it gains with practice**. Artifacts explain 81% of between-study variance, rising to 99% without three outliers.
- In the Skuy et al. (2002) Raven's mediation-training data (N = 95), gains correlated negatively with item g loadings. The first factor's variance fell from 22% to 18% after training, so the test became *less* g-loaded. Low-g participants gained most, and gains did not transfer to another test or to academic performance.
- Earlier work cited in the paper (te Nijenhuis et al., 2001) found that practice and coaching reduced a battery's g loading from .53 to .49.
- **Caveat:** the method of correlated vectors (Jensen's method) has known weaknesses, which the authors acknowledge.

This is the empirical form of **Jensen's** argument (*The g Factor*, 1998 [citation details unconfirmed]) that training and practice raise scores on specific abilities and test-specific variance without raising g.

### 2.2 Latent-variable and invariance tests

**Lievens, Reeve & Heggestad (2007).** *An examination of psychometric bias due to retesting on cognitive ability tests in selection settings.* Journal of Applied Psychology, 92(6), 1672–1682. https://doi.org/10.1037/0021-9010.92.6.1672 (https://ink.library.smu.edu.sg/lkcsb_research/5693)

- N = 941 job candidates in a high-stakes setting. Retesting introduced both **measurement and predictive bias**. The retest factor was "less saturated with g and more associated with memory," and the changes **eliminated the test's criterion-related validity**.

**Estrada, Ferrer, Abad, Román & Colom (2015).** *A general factor of intelligence fails to account for changes in tests' scores after cognitive practice: A longitudinal multi-group latent-variable study.* Intelligence, 50, 93–99. https://doi.org/10.1016/j.intell.2015.02.004 (https://www.Gwern.net/doc/dual-n-back/2015-estrada.pdf)

- N = 477 undergraduates were randomized to memory-span practice, processing-speed practice, or a passive control. Measures were RAPM and three DAT subtests, with odd items at pretest and even items at posttest about 4 weeks later.
- **All three groups gained**, including the passive control. Spatial relations gained about d = 0.65 in every group, while abstract reasoning gained about 0. Configural and weak invariance held, but the model attributing the change to the latent g mean was **rejected** (Δχ² = 112.25, Δdf = 1). The changes were test-specific, and rank order on g was almost perfectly stable (r ≈ .975–.993).

**Freund & Holling (2011).** *How to get really smart: Modeling retest and training effects in ability testing using computer-generated figural matrix items.* Intelligence, 39(4), 233–243. https://doi.org/10.1016/j.intell.2011.02.009 (https://fis.leuphana.de/en/publications/how-to-get-really-smart-modeling-retest-and-training-effects-in-a/)

- N = 189 took rule-based, automatically generated matrices, with training vs control groups and identical vs parallel retest forms. Training raised scores beyond retest. Identical vs parallel forms made little difference at the individual level. The Rasch model fit at both times, **but item difficulties were not invariant over time**. The authors conclude that directly comparing test and retest scores is problematic even with carefully constructed items.

### 2.3 Contrast with the Flynn effect

- **Pietschnig & Voracek (2015)**, Perspectives on Psychological Science. https://doi.org/10.1177/1745691615577701 (https://www.psychologicalscience.org/journals/perspectives/1745691615577701/). Across 271 samples and about 4 million people (1909–2013), gains were about 2.8 FSIQ points per decade (fluid 4.1, spatial 3.0, crystallized 2.1), and the gains have slowed in recent decades.
- **Wicherts et al. (2004)**, *Are intelligence tests measurement invariant over time? Investigating the nature of the Flynn effect*, Intelligence, 32 (https://www.Gwern.net/doc/iq/2004-wicherts.pdf). Cohort gains were **not measurement invariant**, so they cannot be read simply as gains in the latent abilities.
- **te Nijenhuis & van der Flier (2013)**, *Is the Flynn effect on g?: A meta-analysis*, Intelligence, 41(6), 802–807 (https://stafforini.com/works/te-nijenhuis-2013-flynn-effect-metaanalysis/). The true correlation between g loadings and Flynn gains was −.38 (5 papers, N = 16,663). This is negative, but much weaker than the −.95 for retest gains.
- **Interpretation for the paper:** both secular (Flynn) gains and retest gains violate invariance. Retest gains, however, are *far more strongly* concentrated on the least g-loaded, most practice-sensitive content. "My score went up 5 points after practice" is therefore the textbook example of a hollow gain.

### 2.4 Benchmark for a genuine environmental effect

**Ritchie & Tucker-Drob (2018).** *How much does education improve intelligence? A meta-analysis.* Psychological Science. https://doi.org/10.1177/0956797618774253 (https://www.research.ed.ac.uk/en/publications/how-much-does-education-improve-intelligence-a-meta-analysis/)

- 142 effect sizes, 42 datasets, over 600,000 participants, three quasi-experimental designs (control for prior IQ, policy-change instruments, school-entry regression discontinuity). Each additional year of education raised IQ by **about 1–5 points**.
- This is a useful anchor: a full **year** of schooling yields an effect comparable to, or smaller than, the **one-month** retest effect on a Wechsler FSIQ. Any claim that a few weeks of practice tasks raised "intelligence" by 5+ points should be judged against this.

---

## 3. Cognitive-training transfer literature

### 3.1 The founding claim

**Jaeggi, Buschkuehl, Jonides & Perrig (2008).** *Improving fluid intelligence with training on working memory.* PNAS, 105(19), 6829–6833. https://doi.org/10.1073/pnas.0801268105 (https://Www.Gwern.net/doc/dual-n-back/2008-jaeggi.pdf)

- Dual n-back, about 25 min/day over 8–19 days, with Gf measured by RAPM or BOMAT parallel forms under a **10-minute speeded administration**. Trained groups gained more than controls (d = 0.65; controls gained d = 0.25 from retest). Gains rose with dose (17–19 days > 8 days).
- Design weaknesses later criticized: **passive (no-contact) controls**, small cells (n ≈ 15–22), different Gf tests across dose groups, each dose run as a separate experiment, speeded short forms, and no follow-up.

### 3.2 Meta-analyses

**Au, Sheehan, Tsai, Duncan, Buschkuehl & Jaeggi (2015).** *Improving fluid intelligence with training on working memory: a meta-analysis.* Psychonomic Bulletin & Review. https://doi.org/10.3758/s13423-014-0699-x (https://Www.Gwern.net/doc/dual-n-back/2014-au.pdf)

- 20 studies, 24 comparisons. g = **0.24** (SE 0.07), about 3–4 IQ points.
- **Passive controls g = 0.44 vs active controls g = 0.06** (p < .01). The authors attribute the difference to remuneration and international-site confounds; critics attribute it to expectancy and engagement.

**Melby-Lervåg & Hulme (2013).** *Is working memory training effective? A meta-analytic review.* Developmental Psychology, 49(2), 270–291 (online 2012). https://doi.org/10.1037/a0028228 (summary: https://archive.memory-key.com/research/news/review-working-memory-training-programs-finds-no-broader-benefit)

- 23 studies. Near-transfer gains on WM were short-lived. **No transfer to nonverbal ability in well-designed studies;** studies with untreated controls tended to find transfer and studies with treated controls did not.

**Melby-Lervåg, Redick & Hulme (2016).** *Working memory training does not improve performance on measures of intelligence or other measures of "far transfer": Evidence from a meta-analytic review.* Perspectives on Psychological Science, 11(4), 512–534. https://doi.org/10.1177/1745691616635612 (PDF: https://discovery-pp.ucl.ac.uk/10120081/1/1745691616635612.pdf)

- 87 publications, 145 comparisons.
- Near transfer (immediate): verbal WM g = 0.31 (treated controls) / 0.42 (untreated). Visuospatial WM g = 0.28 / 0.51.
- **Nonverbal ability (immediate): treated controls g = 0.05 [−0.02, 0.13]; untreated controls g = 0.20 [0.11, 0.28].** At about 5-month follow-up: −0.05 and 0.03.
- Some apparent far-transfer effects came from control groups whose scores *declined* from pre to post, which the authors call implausible measurement error. Excluding those comparisons, the reading-comprehension effect dropped from 0.15 to 0.08.

**Sala & Gobet (2017).** *Does far transfer exist? Negative evidence from chess, music, and working memory training.* Current Directions in Psychological Science, 26(6), 515–520. https://doi.org/10.1177/0963721417712760 (https://eprints.lse.ac.uk/102204/). Far-transfer effects are small to moderate and "inversely related to the quality of the experimental design."

**Sala, Aksayli, Tatlidil, Tatsumi, Gondo & Gobet (2019).** *Near and far transfer in cognitive training: A second-order meta-analysis.* Collabra: Psychology, 5(1), 18. https://doi.org/10.1525/collabra.203 (https://livrepository.liverpool.ac.uk/3043493/). Data: https://osf.io/qk2vu

- 332 studies, 1,555 effects. WM training produces near transfer, moderated by population. After controlling for placebo effects and publication bias, **the overall far-transfer effect and its true variance were both zero.** The authors conclude: "The lack of generalization of skills acquired by training is thus an invariant of human cognition."

**Redick et al. (2013).** *No evidence of intelligence improvement after working memory training: A randomized, placebo-controlled study.* Journal of Experimental Psychology: General, 142(2), 359–379 [citation details unconfirmed] (summary: https://scottbarrykaufman.com/study-alert-no-evidence-of-intelligence-improvement-after-working-memory-training-a-randomized-placebo-controlled-study). Groups were dual n-back, an adaptive visual-search active control, and a no-contact control, with 20 sessions and pre/mid/post testing on multiple Gf measures. The training tasks improved, with **no transfer** to any ability test. This is a template for the three-arm design recommended below.

### 3.3 Reviews

**Simons, Boot, Charness, Gathercole, Chabris, Hambrick & Stine-Morrow (2016).** *Do "brain-training" programs work?* Psychological Science in the Public Interest, 17(3), 103–186 [citation details unconfirmed] (APS release: https://www.psychologicalscience.org/news/releases/brain-training-claims-not-backed-by-science-report-shows.html)

- Trainees improve on practiced tasks, with "little evidence for broad transfer," and no compelling evidence of real-world benefit.
- Methodological standards they set out, all of which apply directly here: active controls with **matched expectations**, adequate samples, full reporting of all outcomes (no selective reporting), no redundant publication, no generalizing from special populations, and outcome measures that are not simply the trained task.

**Boot, Simons, Stothart & Stutts (2013).** *The pervasive problem with placebos in psychology: Why active control groups are not sufficient to rule out placebo effects.* Perspectives on Psychological Science, 8(4). https://doi.org/10.1177/1745691613491271. Active controls only isolate the treatment's effect if expectations are equated, so **expectations should be measured**.

### 3.4 Expectancy and placebo

**Foroughi, Monfort, Paczynski, McKnight & Greenwood (2016).** *Placebo effects in cognitive training.* PNAS, 113(27), 7470–7474. https://doi.org/10.1073/pnas.1601243113 (https://pmc.ncbi.nlm.nih.gov/articles/PMC4941515)

- N = 50 self-selected through a "brain training can increase fluid intelligence" flyer or a neutral flyer. Both groups did **1 hour** of dual n-back.
- The placebo-recruited group improved d = 0.50 (RAPM) and 0.39 (BOMAT) within-group. **Group × time effects were d = 0.98 and 1.34**, which the authors equate to roughly 5–10 IQ points. Neutrally recruited controls did not change.
- The placebo group scored much higher on the Theories of Intelligence (growth mindset) scale (d = 2.15).
- **Implication:** recruitment wording ("improve your IQ") alone can produce effects as large as any claimed training effect. Use neutral recruitment and measure expectations and mindset.

---

## 4. Strategy training on matrices, test-wiseness, and item familiarity

**Hayes, Petrov & Sederberg (2015).** *Do we really become smarter when our fluid-intelligence test scores improve?* Intelligence, 48, 1–14 [DOI 10.1016/j.intell.2014.10.005 unconfirmed] (https://alexpetrov.com/pub/intel14)

- Eye-tracking (scanpath) analysis of RAPM at pre- and posttest (N = 35). Changes in solution **strategy** (toward constructive matching: systematic scanning of the matrix before consulting response options) explained about **one-third of the variance in score gains**. After removing the strategy component, the remaining gains were not significant. The authors warn against reading training-related RAPM gains as gains in Gf.

**Constructive matching vs response elimination.** Matrix items can be solved by inducing the rule and constructing the answer, or by eliminating response options using their features. Instructing people in the former, or simply exposing them to the item format, raises scores. Relevant studies:

- **Kirby & Lawson (1983).** *Effects of strategy training on Progressive Matrices performance.* Contemporary Educational Psychology, 8(2), 127–140. https://doi.org/10.1016/0361-476X(83)90004-8. Strong analytic-strategy training improved Progressive Matrices performance, and the gains persisted. This is an early demonstration that matrix scores are trainable through strategy instruction.
- **Krautter, Lehmann, Kleinort, Koch, Spinath & Becker (2021).** *Test preparation in figural matrices tests: Focus on the difficult rules.* Frontiers in Psychology, 12, 619440. https://doi.org/10.3389/fpsyg.2021.619440. N = 287 adults were randomized to no training, easy-rule training, difficult-rule training, or all-rule training before a 26-item distractor-free matrices test. **Training only the difficult rules improved scores** (Cliff's d ≈ 0.39 vs no training). It also raised performance on easy-rule items (d_RTE = 0.79), which the authors read as facilitation of the overall solution process rather than transfer. This study comes from the Saarland group (Becker, Spinath and colleagues); it is likely the "Schneider et al." line of matrix-preparation work the brief refers to, but **the specific "Schneider et al." reference is [unconfirmed]**. Check the intended paper.
- **Lozano, Embretson & Revuelta (2025)**, Journal of Intelligence, 13(11), 147 (https://doi.org/10.3390/jintelligence13110147): rule-specific learning occurs *within* a single matrices session and varies between people.
- **Freund & Holling (2011)** and **Estrada et al. (2015)**, above: item-difficulty non-invariance and test-specific (non-g) gains.

**Test-wiseness.** Millman, Bishop & Ebel (1965), *An analysis of test-wiseness*, Educational and Psychological Measurement, 25, 707–726 [citation details unconfirmed]. This is the classic taxonomy of construct-irrelevant skills (time use, error avoidance, guessing, deductive reasoning from options, cue use). On matrix tests, the relevant forms are option-elimination heuristics, pacing under time limits, and knowledge of the small rule set (Carpenter, Just & Shell, 1990, rule taxonomy [citation details unconfirmed]).

**Item familiarity vs ability: the core inference problem.** Matrix tests have few rule types, so training on Raven-like items teaches *the test's grammar*. A higher score afterwards reflects some mix of (a) memory for specific items (if the items overlap), (b) rule and strategy knowledge, (c) reduced anxiety and better pacing, and (d) genuine change in reasoning capacity. The literature in sections 2–4 indicates that (a)–(c) account for most or all of the gain. A study that wants to say anything about (d) must use **untrained outcome formats** (different item types measuring the same construct), check invariance, and include an active control that receives equal exposure to the format but no rule instruction.

---

## 5. Design recommendations for a before/after study

### 5.1 Alternate or parallel forms and counterbalancing

- Alternate forms roughly halve retest gains (Hausknecht: 0.24 vs 0.46; Scharfen: 0.23 vs 0.37) but **do not eliminate them**. Use item-level parallel forms (for example ICAR item pools, MaRs-IB items, or automatically generated matrices; see section 6) with demonstrated difficulty equivalence.
- **Counterbalance** form order (A→B for half the participants, B→A for the rest) within each arm, so that any form-difficulty difference is not confounded with time. Analyze form and order as factors. Winter et al. (2024) note that in counterbalanced designs the second-administered test carries a practice boost, so model the order effect explicitly.
- **Never use the same items in training and outcome.** Training items should be structurally similar (to test near transfer) but drawn from a disjoint pool.

### 5.2 Control groups

- **Minimum: a three-arm RCT** (as in Redick et al., 2013):
  1. **Training:** IQ-style practice tasks with feedback and strategy instruction.
  2. **Active control:** matched time on screen, matched engagement and difficulty, a plausible "cognitive" framing, and matched expectations (for example adaptive visual search, trivia, or general-knowledge quizzes), with **no exposure to the outcome item formats or rules**.
  3. **Retest-only control:** pre/post testing only. This estimates the pure retest effect, which can be compared with the meta-analytic 0.23–0.37.
- Optional fourth arm: **format exposure without strategy instruction** (same item types, no feedback or rule teaching). This separates familiarity from coaching.
- Why this matters: with passive controls the training effect on Gf is g = 0.44, and with active controls it is 0.06 (Au et al., 2015). The figures are 0.20 vs 0.05 for nonverbal ability (Melby-Lervåg et al., 2016).

### 5.3 Double baseline or run-in

- Give **two baseline sessions** (T0a and T0b, alternate forms) before randomization, or a practice run-in (Goldberg et al., 2015). Because most of the retest gain happens between the 1st and 2nd sessions (0.33) and it plateaus by the 3rd or 4th (Scharfen et al., 2018), T0b gives a familiarized baseline. The T0a→T0b change also gives a *within-sample* estimate of each person's practice effect and of test–retest reliability for RCI computation.
- Analyze T0b→T1 (post) as the primary contrast, with T0b as the covariate.

### 5.4 Retest interval and follow-up

- Choose a pre/post interval that matches the training duration (for example 3–6 weeks), and hold it **constant across arms**.
- Add a **delayed follow-up** (for example 3–6 months): the far-transfer effects reported in some studies disappear by follow-up (Melby-Lervåg et al., 2016: about 0).

### 5.5 Individual-level change statistics

- **Reliable Change Index** (Jacobson & Truax, 1991, *Clinical significance: A statistical approach to defining meaningful change in psychotherapy research*, Journal of Consulting and Clinical Psychology, 59(1), 12–19; DOI 10.1037/0022-006X.59.1.12 [DOI unconfirmed]; formula reference: https://www.psyctc.org/psyctc/root/stats/rcsc/):
  - SE_diff = SD₁ · √2 · √(1 − r_xx); RCI = (X₂ − X₁) / SE_diff; |RCI| > 1.96 indicates reliable change at 95%.
  - Use reliability and SD from your own sample where possible, and report which reliability coefficient was used (internal consistency vs test–retest).
- **Practice-adjusted RCI** (Chelune, Naugle, Lüders, Sedlak & Awad, 1993, Neuropsychology, 7(1), 41–52 [citation details unconfirmed]): subtract the mean practice effect (estimated from the control arm or the T0a→T0b change) before dividing by SE_diff. Equivalently, add the practice effect to the confidence limits. Chelune-style applications often use a 90% CI (±1.64) (Conradi et al., 2020, Frontiers in Psychology, 11:582836, https://doi.org/10.3389/fpsyg.2020.582836).
- **Standardized regression-based (SRB) change** (McSweeny, Naugle, Chelune & Lüders, 1993 [citation details unconfirmed]): regress T2 on T1 (plus age, education, interval) in the control group, then z = (observed T2 − predicted T2) / SE_est. This handles both practice effects and **regression to the mean**.
- Overview: Duff (2012), *Evidence-based indicators of neuropsychological change in the individual patient: Relevant concepts and methods*, Archives of Clinical Neuropsychology, 27(3), 248–261. https://doi.org/10.1093/arclin/acr120

### 5.6 Regression to the mean and ceiling effects

- **Regression to the mean** (Barnett, van der Pols & Dobson, 2005, International Journal of Epidemiology, 34(1), 215–220 [pages unconfirmed]; https://pubmed.ncbi.nlm.nih.gov/15333621/): low scorers at baseline will "improve" and high scorers will "decline" with no intervention. This matters most if participants are **selected on baseline scores**, or if the paper reports that "low scorers benefited most" (as in te Nijenhuis et al., 2007). Remedies: randomize, use ANCOVA with baseline as covariate, use SRB norms, and never select on a single baseline score (the double baseline helps).
- **Ceiling effects:** short tests (for example ICAR-16, or the HMT-S with 6 items) will hit the ceiling in high-ability samples (university students), which caps measurable gains and distorts gain-score distributions. Pilot the outcome test and target a mean proportion correct of about .50–.60. Use IRT scoring (ICAR has IRT parameters) and report the percentage at floor and ceiling at each wave.

### 5.7 Preregistration, blinding and expectations

- **Preregister** (OSF or AsPredicted) the hypotheses, the primary outcome (one composite), the analysis (ANCOVA or mixed model), the SESOI, exclusions, and stopping rule. Simons et al. (2016) document selective reporting and outcome switching in this field.
- **Blinding:** use neutral recruitment wording ("a study of puzzle solving"), not "boost your IQ" (Foroughi et al., 2016). Keep outcome assessors and scorers blind to arm (automated scoring helps). Participants cannot be fully blinded, so **equate and measure expectations**.
- **Expectation measures:** before and after training, ask "How much do you expect your reasoning test score to improve?" and administer the Theories of Intelligence (mindset) scale used by Foroughi et al. (2016). Test whether arms differ and include expectations as a covariate or moderator (Boot et al., 2013).
- Record and report **training-task improvement** separately from outcome change, as evidence of engagement and of near transfer.

### 5.8 Power and sample size (computed for this brief)

Two-tailed α = .05, two independent groups, normal approximation (equivalent to G*Power within ±1):

| Effect d (between-arm, post) | n/arm @ 80% power | n/arm @ 90% power |
|---|---|---|
| 0.20 | about 393 | about 526 |
| **0.30** | **about 176** | **about 234** |
| 0.40 | about 99 | about 132 |
| 0.50 | about 64 | about 85 |

With **ANCOVA adjusting for baseline**, the required n is multiplied by about (1 − r²), where r is the pre–post correlation:

| r (pre–post) | n/arm for d = 0.30 @ 80% | @ 90% |
|---|---|---|
| 0.6 | about 112 | about 150 |
| 0.7 | about 89 | about 120 |
| 0.8 | about 63 | about 84 |

- Recommendation: plan for **about 120 per arm** (d = 0.30, r ≈ .7, 90% power), then inflate by the expected attrition (for example 15–20%), which gives **about 140–150 randomized per arm**. With three arms, that is about 420–450 participants.
- If the research question is *equivalence* (that is, showing no meaningful far transfer), use a TOST equivalence test with a preregistered SESOI (for example d = ±0.20, about 3 IQ points, comparable to the education-per-year effect). This needs larger samples (roughly n ≈ 430+ per arm at 80% power for bounds of ±0.2 with r = 0 [approximate; recompute for the final design]).
- The pre–post correlation for short online tests will be lower than for Wechsler composites (r12 = .79–.89 in the WISC-IV data). Estimate it from the T0a/T0b double baseline in a pilot.

### 5.9 Ethics, test security and why real items cannot be used

- **APA Ethics Code Standard 9.11, Maintaining Test Security:** psychologists "make reasonable efforts to maintain the integrity and security of test materials" consistent with law and contractual obligations (APA Test Security FAQ: https://www.apa.org/science/programs/testing/test-security-faq). "Test materials" refers to "manuals, instruments, protocols, and test questions or stimuli," not test data (as quoted in NAN, 2003, *Test Security: An Update*: https://nanonline.org/common/Uploaded%20files/NAN_Position_Papers/NANTestSecurityUpdate.pdf). Note that the APA Ethics Code is under revision (NAN update, March 2025: https://www.nanonline.org/Nanweb/AboutNAN/NewsUpdates/APA_Ethics_Code_Revision_March_2025.aspx), so cite the version in force when the paper is submitted.
- **ITC guidelines** (quoted in the APA FAQ): users should avoid "coaching individuals on actual test materials," and also avoid practice materials that could unfairly change performance.
- **Why practice on real secure items invalidates scores:** norm-referenced scores assume that examinees meet the items for the first time. Pre-knowledge makes the score reflect exposure, not the construct (APA FAQ, "test takers' pre-knowledge of test items [is] a major threat to the utility of an instrument"). NAN (2003) notes that exposed content lets people manipulate scores and evade validity checks, and that re-standardizing the WAIS-III/WMS-III cost several million dollars, took over five years, and required testing more than 5,000 people. Lievens et al. (2007) show empirically that retest scores lose criterion validity.
- **Consequences for the study:**
  1. Practice tasks must be **original items** "modeled on" IQ test formats (matrices, series, analogies, spatial rotation, digit-symbol-type speed tasks), **never reproductions** of WAIS-IV/WAIS-5, Raven's, or other commercial items.
  2. Do not publish secure items in the paper or supplement.
  3. If a Wechsler test is used as an outcome, it requires a qualified examiner. **The WAIS-5 is a Pearson Qualification Level C product** (https://www.pearsonassessments.com/store/en/usd/p/P100071002.html). Level C requires a doctorate in psychology or education (or a closely related field) with formal training in ethical administration, scoring and interpretation, or state licensure, or membership in a body requiring such training (APA, NASP, NAN, INS) (Pearson qualifications policy: https://www.pearsonassessments.com/professional-assessments/ordering/how-to-order/qualifications/qualifications-policy.html).
  4. Participants given a Wechsler test in the study may be **invalidated for clinical or forensic Wechsler testing** within about a year (AAIDD convention). Disclose this in the consent form.
  5. **Debriefing:** explain that score changes after practice do not indicate changed intelligence, and do not give participants IQ-style scores implying clinical meaning.
- The study should obtain ordinary IRB/ethics approval, informed consent, and data protection (GDPR if in the EU or France).

---

## 6. Online "IQ tests" vs validated instruments, and open outcome measures

### 6.1 Why commercial and online "IQ tests" are not legitimate outcomes

A legitimate IQ score requires (a) a **representative, stratified norm sample**, (b) documented **reliability** (internal consistency, test–retest, SEM), (c) **validity evidence** (factor structure, convergent correlations with established batteries, criterion prediction), (d) standardized, usually **supervised**, administration, and (e) **item security**. Popular online IQ tests typically lack published norms and technical manuals, use self-selected samples, and have unknown reliability. Their scores therefore cannot be expressed on the IQ metric in a defensible way [general psychometric principle; no meta-analysis of specific commercial sites was located; specific claims about particular sites are **unconfirmed**].

Evidence on **unsupervised web testing** in general: Zinn, Landrock & Gnambs (2021), Behavior Research Methods, 53(3), 1202–1217. https://doi.org/10.3758/s13428-020-01480-7. Among N = 17,473 students randomized to paper, supervised computer, or unsupervised web testing, web testing was "not strictly equivalent." Measurement bias was small (about 1–2.5% of the total score), but **reliability was lower (.70–.71 vs .79–.80 supervised)**. Implication: online outcome testing is acceptable for research if mode is held constant across arms and waves, but expect reduced reliability and plan power accordingly.

### 6.2 Public-domain and open alternatives usable as outcomes

**ICAR (International Cognitive Ability Resource).** Condon & Revelle (2014), *The International Cognitive Ability Resource: Development and initial validation of a public-domain measure*, Intelligence, 43, 52–64. https://doi.org/10.1016/j.intell.2014.01.004 (PDF: https://personality-project.org/revelle/publications/condon.icar.14.pdf)

- ICAR-60 has 60 items in four types: Letter-Number Series (9), Matrix Reasoning (11), Verbal Reasoning (16), and 3-D Rotation (24).
- **ICAR-16** (4 items per type) has α = .81 and ω_total = .83. ICAR-60 has α = .93.
- Validity: ICAR-16 correlated .59 with SAT and .52 with ACT (self-report, corrected), and .81–.82 with Shipley-2 composites (corrected; .41 uncorrected) in a small offline sample (N = 137).
- **Young & Keith (2020)**, *An examination of the convergent validity of the ICAR16 and WAIS-IV*, Journal of Psychoeducational Assessment, 38(8), 1052–1059. https://doi.org/10.1177/0734282920943455. In N = 97 students, **ICAR-16 correlated r = .81 with WAIS-IV FSIQ** and .94 with latent g. Letter-number series loaded on Gf, and the other ICAR tasks on Gv.
- **Young, Keith & Bond (2019)**, *Age and sex invariance of the ICAR*, Intelligence, 77, 101399. https://doi.org/10.1016/j.intell.2019.101399. ICAR is invariant across age and sex, but its **subscales have weak internal consistency**, so use the **total score only**.
- **Access:** items, data and **automatic item generators** are distributed for **scientific use** through PsychArchives (https://doi.org/10.23668/psycharchives.22167; record: https://psycharchives.org/en/item/be35b8b4-2bc7-4691-964d-52cfc1cf17a9). The archive is deliberately *not* fully public, "to protect the integrity of the item material, such as the scoring keys." Researchers should respect this: do not reproduce ICAR items in the paper or use them as training items. The item generators are ideal for building **parallel forms**.

**Hagen Matrices Test (HMT / HMT-S).** Heydasch, Haubrich & Renner (2013), *The short version of the Hagen Matrices Test (HMT-S): A 6-item induction intelligence test*, Methods, Data, Analyses, 7(2). https://doi.org/10.12758/mda.2013.021 (https://majournals.bib.uni-mannheim.de/mda/article/view/2013.021; ZIS: https://zis.gesis.org/skala/openScale/326). The HMT-S is a free 6-item induction (Gf) test with α = .62. It correlates r = .78–.79 with the full **20-item HMT** (Heydasch, 2014), and validity evidence includes the IST-2000 R and academic performance. The HMT-S is **too short and unreliable for individual change**; the 20-item HMT is better, but its reliability and norms are **[unconfirmed]** here (ZIS listing: https://zis.gesis.org/skala/openScale/359).

**MaRs-IB (Matrix Reasoning Item Bank).** Chierchia, Fuhrmann, Knoll, Pi-Sunyer, Sakhardande & Blakemore (2019), *The matrix reasoning item bank (MaRs-IB): Novel, open-access abstract reasoning items for adolescents and adults*, Royal Society Open Science, 6(10), 190232. https://doi.org/10.1098/rsos.190232 (https://discovery.ucl.ac.uk/id/eprint/10085176). There are 80 matrix items under a CC BY 4.0 license, with an online implementation (Gorilla open materials: https://gorilla.sc/openmaterials/36164). The item bank is large enough to build parallel forms. Psychometric details (reliability, parallel-form equivalence) should be taken from the paper and follow-up validations [values unconfirmed here].

**Sandia Matrices.** Matzen et al. (2010), *Recreating Raven's: Software for systematically generating large numbers of Raven-like matrix problems with normed properties*, Behavior Research Methods, 42(2), 525–541. https://doi.org/10.3758/BRM.42.2.525. Generator software and the normed stimuli are at https://github.com/sandialabs/Matrices (no license is stated on the repository, so clarify before redistributing). This is useful for generating *training* items that are structurally similar to, but disjoint from, outcome items.

**Recommended outcome battery (all non-secure, all different from training items):**

1. **Primary:** ICAR-60 (or two ICAR-16-sized parallel forms built from ICAR generators), IRT-scored, total score only.
2. **Near-transfer probe:** a matrix form drawn from MaRs-IB or the Sandia items, structurally like the training items but disjoint from them.
3. **Far-transfer / untrained format:** a Gf measure in a format *not* practiced (for example letter-number series if training used only matrices, or a verbal analogy test), plus optionally a criterion such as GPA or an applied problem-solving task.
4. **Optional clinical anchor (subsample):** WAIS-5 FSIQ, administered by a Level-C-qualified psychologist, at pre and long-delayed follow-up only.

---

## 7. Recommended study design

**Title concept:** "Does practicing IQ-style items raise intelligence, or only scores? A preregistered, three-arm randomized trial with double baseline."

**Research questions.**
- RQ1: How large are score gains on trained item formats after X weeks of IQ-style practice, compared with an active control and with retest-only? (Expected: large, about 0.5–0.7 SD on the trained format.)
- RQ2: Do the gains transfer to untrained Gf formats and to a g composite? (Expected: about 0, based on Sala et al., 2019 and Melby-Lervåg et al., 2016; this is a TOST equivalence hypothesis.)
- RQ3: Are the gains measurement-invariant and g-loaded? (Expected: no; Estrada et al., 2015; te Nijenhuis et al., 2007.)
- RQ4: Do expectations or mindset moderate the gains? (Foroughi et al., 2016.)

**Participants.** Healthy adults aged 18–65. Use neutral recruitment ("study of puzzle solving and attention") with no IQ-boost framing. Exclude anyone with Wechsler testing in the past 12 months, and ask about prior IQ-test practice. Target **about 150 randomized per arm** (450 total for 3 arms) to give about 120 completers per arm, which provides 90% power for d = 0.30 with ANCOVA at r ≈ .7. Increase the sample if the primary analysis is equivalence (TOST, SESOI d = ±0.20).

**Arms (individually randomized, stratified by T0b score and age).**
1. **IQ-practice training:** original items modeled on matrices, series, analogies, rotation and coding, adaptive, with feedback and explicit rule and strategy instruction (constructive matching), for example 30 min × 15 sessions over 5 weeks.
2. **Active control:** identical schedule, interface, adaptivity and feedback, but with non-reasoning content (for example visual search, trivia), framed as equally "cognitive." Expectations are matched and measured.
3. **Retest-only control:** testing sessions only, plus contact-matched check-in messages.
4. *(Optional)* **Exposure-only:** IQ-style items without feedback or strategy instruction, to separate familiarity from coaching.

**Assessment schedule.**
- **T0a (week −1)** and **T0b (week 0)**: double baseline, alternate forms A and B, counterbalanced. Expectation and mindset measures. T0a→T0b gives individual practice effects and test–retest r.
- **T1 (week 6)**: post-test, form C (or counterbalanced A/B/C Latin square). Expectations and blinding check ("which group do you think you were in?").
- **T2 (about 6 months)**: delayed follow-up, form D.
- Keep the testing mode (supervised online or lab) and the interval identical across arms. Automated scoring keeps assessors blind.

**Measures.** See the outcome battery in section 6.2: ICAR primary composite, near-transfer matrices, untrained-format Gf, optional WAIS-5 subsample. Also record training-task learning curves, Theories of Intelligence, expected improvement, test anxiety, and effort or engagement checks.

**Analysis (preregistered).**
- Primary: ANCOVA or linear mixed model, T1 outcome ~ arm + T0b (+ T0a) + form order + age. Report contrasts Training vs Active (key causal contrast) and Active vs Retest-only (expectancy and engagement), with d and 95% CI. Correct for multiplicity across outcomes.
- **TOST equivalence** for far transfer against SESOI d = ±0.20 (about 3 IQ points, roughly one year of schooling per Ritchie & Tucker-Drob).
- Individual change: practice-adjusted RCI (Chelune) and SRB z-scores derived from the retest-only arm. Report the percentage of reliable improvers per arm.
- **Measurement invariance** (configural, metric, scalar) across time and arm. Test whether the gains sit at the latent g level or at the test-specific intercept level (Estrada et al., 2015 approach). Optionally, run a correlated-vectors analysis of item g loadings vs item gains as a secondary analysis, noting its limitations.
- Moderators: expectations, mindset, baseline ability (with an explicit regression-to-the-mean correction), and age.
- Report floor and ceiling percentages, attrition by arm (CONSORT diagram), and all collected measures.

**Ethics and test security.** All training items are original. No commercial or secure items are reproduced, and ICAR items are used under scientific-use terms and not published. Any Wechsler use requires a Level-C-qualified examiner, and its retest-invalidation risk goes in the consent form. Debrief that practice-related score gains do not reflect changed intelligence. Comply with APA Standard 9.11 (or the revised equivalent), ITC guidelines, IRB/CPP review, and GDPR.

**Expected results, stated in advance (for interpretation).**
- Retest-only arm: gain of about **0.25–0.35 SD** on alternate forms (Scharfen: 0.23 alternate / 0.33 overall; Hausknecht: 0.24 alternate).
- Training arm on trained formats: about **0.5–0.7 SD** (coaching δ = 0.70).
- Training vs active control on untrained Gf and the g composite: about **0–0.1 SD** (Au: 0.06 active; Melby-Lervåg: 0.05; Sala: about 0).
- A positive far-transfer finding would need to survive active control, expectation adjustment, invariance testing, and the 6-month follow-up before being described as a change in intelligence.

---

## Verification checklist

Full citations with URLs/DOIs are given inline at first mention in each section above.

**Items flagged [unconfirmed] that need checking before submission:** WAIS-IV/WAIS-5 index-level retest gains; Calamia et al. per-domain values; Kulik et al. (1984) primary-paper values and citations; Estes (1974), Chelune et al. (1993), McSweeny et al. (1993), Millman et al. (1965), Simons et al. (2016) and Redick et al. (2013) page and DOI details; Hausknecht et al. (2007) volume/pages/DOI; Hayes et al. (2015) DOI; Estevis et al. (2012) values; the "Schneider et al." matrix-training reference; HMT-20 and MaRs-IB reliability values; the TOST sample-size approximation.
