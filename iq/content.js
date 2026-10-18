/* Cognitive test practice: text for each task page and the Method page. Facts about the real
   batteries and the research come from research/batteries.md and research/practice-effects.md in
   the project files; anything those reports could not confirm is marked as such here too. */
(function () {
  "use strict";
  const C = window.IQCONTENT = window.IQCONTENT || {};
  const li = a => `<ul>${a.map(x => `<li>${x}</li>`).join("")}</ul>`;

  C.tasks = {
    matrix: {
      what: "A 3 × 3 (or 2 × 2) grid of figures with one cell missing; pick the choice that completes it. In the WAIS-5 it is a primary Fluid Reasoning subtest and counts toward the FSIQ. Raven's Progressive Matrices use the same idea in longer timed sets.",
      admin: "WAIS-IV: 26 items scored 0 or 1, started at item 4, stopped after 3 misses in a row. There is no strict time limit; a guide of about 30 seconds per item is reported. The WAIS-5 keeps 26 items; its exact rules are not public. Raven's APM is often given as 36 items in 40 minutes.",
      differs: "Items are generated from the five rule types of Carpenter, Just and Shell (1990): constant in a row, progression, distribution of three values, figure addition or subtraction, and distribution of two values (exclusive or). Here every test starts at item 1, so raw scores are not on the WAIS scale. Eight choices built so each feature is right in exactly half of them, so the answer cannot be guessed from the choices alone.",
      strategy: li([
        "<b>Constructive matching:</b> work out the rule from the rows first, picture the missing cell, and only then look at the choices. Switching to this strategy explained about a third of retest gains on Raven's in one eye-tracking study (Hayes, Petrov & Sederberg 2015).",
        "Check each feature on its own: shape, size, shading, number, position, turn. Hard items stack several rules.",
        "Check rows <i>and</i> columns; a rule that fits only one row is not the rule.",
        "For overlay items, compare cell 1 and cell 2 with cell 3: is it everything (addition), what is left (subtraction) or only what differs (exclusive or)?",
        "The number of rules in an item predicts its difficulty well (about 57% of error variance in Carpenter et al. 1990), so expect the late items to have three or more.",
      ]),
      trains: "Training the difficult rules raised matrix scores by about d = 0.39 against no training in Krautter et al. (2021). These gains come from knowing the test's rule grammar and do not show up as a change in g (see the Method page).",
    },
    weights: {
      what: "Two or three scales show which shapes balance each other. A last scale has an empty pan; pick the set of shapes that keeps it level. A primary Fluid Reasoning subtest and part of the FSIQ in the WAIS-5 (quantitative reasoning).",
      admin: "WAIS-IV: <b>20 seconds</b> for the early items (1 to 12) and <b>40 seconds</b> for the later ones (13 and up). Start at item 4, stop after 3 misses in a row. The WAIS-5 time limits are not public.",
      differs: "Hidden whole-number weights are drawn, then scales are kept only if they pin every weight down (the answer always follows from the scales alone). Wrong choices weigh 1 to 3 units more or less and have a similar number of pieces. Levels 1 to 4 use 20 s, the rest 40 s.",
      strategy: li([
        "Turn every scale into an equation: one triangle = three circles.",
        "Rewrite everything in the lightest shape, then count.",
        "With three scales, substitute: if A = 2B and B = 3C, then A = 6C.",
        "Count the question side first, then check each choice: only one weighs the same.",
      ]),
      trains: "Pure arithmetic substitution, so it improves fast with practice. Expect a large practice effect on this format.",
    },
    series: {
      what: "A series of numbers or letters; choose what comes next. This is the ICAR letter-number series type (public domain, untimed), also used in group ability tests.",
      admin: "ICAR: untimed. Here a 60 second guide is shown but not enforced.",
      differs: "Generated from rule families: steady steps, growing steps, multiplication, alternating sequences, Fibonacci-like sums, squares. Letters stand for their place in the alphabet.",
      strategy: li(["Write the differences between neighbours; if they are not constant, take the differences of differences.", "Check alternate positions (1st, 3rd, 5th) as their own series.", "For letters, turn them into numbers (A = 1)."]),
      trains: "Useful as an <b>untrained format</b> outcome if your training group practises only matrices.",
    },
    puzzle: {
      what: "A target shape and six pieces; pick the three that together make the shape. A primary Visual Spatial subtest in the WAIS-5.",
      admin: "WAIS-IV: <b>20 seconds</b> for items 1 to 7 and <b>30 seconds</b> for the rest, with a prompt (“Do you have an answer?”) at 10 seconds left. Credit only if all three pieces are right. Start at item 5, stop after 3 misses in a row. Whether pieces may be flipped is not confirmed in public sources; here they may be turned but never flipped.",
      differs: "Shapes are grid figures with some half-square triangles, cut into three connected pieces. The three decoys have the same areas as the real pieces, so counting squares never gives the answer away, and a search checks that only one set of three fits. Pieces are drawn at the same scale as the target.",
      strategy: li(["Start with the most distinctive part of the target (a point, a notch) and find the only piece that can fill it.", "Use size: the three areas must add up to the target.", "Rotate in your head, never flip."]),
    },
    blocks: {
      what: "Rebuild a red and white pattern using blocks that are all red, all white, or half red on a diagonal. A primary Visual Spatial subtest and part of the FSIQ in the WAIS-5.",
      admin: "WAIS-IV: 14 items; 2-block, then 4-block (items 3 to 10) and 9-block designs (items 11 to 14). Time limits <b>30 s</b> (items 1 to 4), <b>60 s</b> (5 to 10), <b>120 s</b> (11 to 14). Start at item 5, stop after <b>2</b> misses in a row. Items 9 to 14 earn time bonus points (4 to 7). The exact bonus cut-offs are not public.",
      differs: "On-screen blocks instead of real cubes, so the motor part is different and times are not comparable with the real subtest. Large designs here earn 4 to 7 points by speed using cut-offs at 25%, 40% and 60% of the limit; these cut-offs are our approximation. The late designs hide the guide lines between blocks, as the hard real items do.",
      strategy: li(["Work block by block in a fixed order (row by row).", "Mentally draw the grid lines on the pattern when they are not shown.", "Find the half blocks first; full red and full white squares are easy.", "Check the whole design before saying done: a wrong block scores zero."]),
    },
    dsf: { what: "The examiner reads digits at one per second; repeat them in the same order. In the WAIS-5 it is its own secondary subtest and is always given before Digit Sequencing.", admin: "WAIS-IV style: two tries at each length, lengths 2 to 9, stop when both tries of a length are wrong. Typical adult forward span is about 6.5 digits (young adults about 7.4).", differs: "Digits are shown (and spoken if you turn on sound) one per second. No digit repeats in a row and no runs like 4-5-6.", strategy: li(["Group the digits in threes, like a phone number.", "Rehearse silently while they come.", "Say them aloud in your head with a rhythm."]) },
    dsb: { what: "Hear digits, repeat them backwards. A secondary WAIS-5 subtest (auditory working memory, manipulation).", admin: "Two tries per length, lengths 2 to 8, stop when both tries are wrong. Typical adult backward span is about 4.9 (young adults about 6.0).", strategy: li(["Hold the list as chunks, then reverse chunk by chunk.", "Visualise the digits written in a row and read them from the right."]) },
    dss: { what: "Hear digits, say them from smallest to largest. A primary Working Memory subtest and the WAIS-5 FSIQ's memory subtest.", admin: "Two tries per length; repeats can appear and must be kept. In the WAIS-IV sample report a longest sequence of 6 had a 52% base rate.", strategy: li(["Keep a mental tally per digit (one 2, two 5s...).", "Sort as they arrive, inserting each new digit into a growing ordered list."]) },
    lns: { what: "Hear a mix of numbers and letters; say the numbers in order, then the letters in alphabetical order. Secondary in the WAIS-5.", admin: "WAIS-IV style: three tries per item, stop when all three tries of an item are wrong.", strategy: li(["Split the list into two buffers as you listen: numbers, letters.", "Sort the numbers first, they are easier."]) },
    running: { what: "Digits keep coming for an unknown time; when they stop, give only the last few. New in the WAIS-5 and a primary Working Memory subtest (it tests updating).", admin: "WAIS-5 rules are not public. Here: the number to recall goes up from 2, two tries each, stop when both are wrong; each list is 2 to 6 digits longer than what you recall.", strategy: li(["Keep only a moving window: drop the oldest digit as each new one arrives.", "Do not try to keep the whole list."]) },
    symspan: { what: "See a sequence of abstract designs, then pick them in the same order from a larger set with look-alikes. Secondary in the WAIS-5 (visual working memory), taken from the WMS-IV.", admin: "WAIS-5 rules are not public. Here: two tries per length, stop when both are wrong.", strategy: li(["Give each design a quick verbal label (“tent”, “hook”).", "Note one distinctive feature per design."]) },
    spatialadd: { what: "Two grids of blue and red dots, one after the other; combine them by a rule, ignoring red. Secondary in the WAIS-5 (visual working memory); the only subtest that requires ignoring a competing distractor.", admin: "WAIS-5 rules are not public. Here: each grid shows for 5 seconds; grids get fuller and red distractors appear from level 3.", strategy: li(["Remember the first grid's blue positions as a shape or as row patterns.", "When the second grid shows, compare cell by cell: shared blue cancels to white."]) },
    arith: { what: "Word problems read aloud, solved in your head. Secondary in the WAIS-5 (quantitative reasoning, expanded fluid); a core Working Memory subtest in the WAIS-IV.", admin: "WAIS-IV: 22 items, <b>30 seconds</b> each, no paper. The problem can be repeated once while the clock keeps running. Start at item 6, stop after 3 misses in a row.", differs: "By default the problem is shown as text, which is easier than hearing it. Turn on “Arithmetic by ear” in Settings for the real format.", strategy: li(["Pull out the numbers and the question before computing.", "Round and correct: 9 × 7 = 70 − 7.", "For rates and work problems, think per unit (per hour, per worker)."]) },
    coding: { what: "A key pairs digits 1 to 9 with symbols; copy the matching symbol under each digit for 120 seconds. A primary Processing Speed subtest and part of the FSIQ in the WAIS-5.", admin: "120 seconds; 135 boxes in the WAIS-IV; no skipping; score = boxes done right.", differs: "You tap the symbol instead of drawing it, so speed is not comparable with paper. The symbols are original designs.", strategy: li(["Learn some pairs by heart in the first seconds; looking up the key is the slow part.", "Do not go back to fix errors."]) },
    symsearch: { what: "Two target symbols and a row of five; decide whether either target appears. A primary Processing Speed subtest in the WAIS-5.", admin: "120 seconds; 60 rows in the WAIS-IV; score = right minus wrong.", differs: "Answer with buttons or keys. Symbols are random original designs.", strategy: li(["Hold both targets in mind, then scan the row once, left to right.", "Wrong answers cost a point: do not guess."]) },
    nsq: { what: "Name as fast as you can how many squares are in each box of an array. New in the WAIS-5 (motor-reduced processing speed).", admin: "WAIS-5 rules are not public; the score is reported as time and errors.", differs: "You tap 1 to 4 instead of saying the number, and the score is boxes right in 60 seconds.", strategy: li(["Recognise small numbers at a glance (subitising) instead of counting."]) },
    similar: { what: "Say how two words are alike. A primary Verbal Comprehension subtest and part of the WAIS-5 FSIQ. Answers are scored 2, 1 or 0.", admin: "WAIS-IV: stop after 3 zeros in a row. Examiners use a scoring guide with sample answers; the real items are secure and not reproduced here.", differs: "Typed answers. In practice you score yourself against sample answers at each level; under standard rules nothing is shown and the answers are exported for blind scoring by a rater.", strategy: li(["Name the most general category that really fits (both are units of length), not a shared detail (both have numbers).", "Never answer with a difference.", "If unsure, give your best general answer: the examiner can ask you to say more."]), trains: "Learning the 2-point principle raises scores on the format without changing word knowledge: a classic test-wiseness gain." },
    vsearch: { what: "Not a test subtest. A visual search task (find a T among Ls) for the <b>active control group</b> of a study: same screen time, same feel of a cognitive task, no reasoning practice.", admin: "Practice rounds last 5 minutes; do as many rounds as the training group's minutes.", strategy: "<p>Nothing to learn here, on purpose.</p>" },
    vocab: { what: "Define words. A primary Verbal Comprehension subtest and part of the WAIS-5 FSIQ.", admin: "Scored 2, 1 or 0 from a scoring guide; the real word list is secure.", differs: "English only; for a study, use a native-language test. Typed answers, self-scored in practice, exported for blind scoring under standard rules.", strategy: li(["Give a synonym plus the main use or defining feature.", "Avoid an example alone: it usually earns 1 point."]) },
  };

  /* ------------------------------------------------------------------------------------------ */
  C.method = `
<h1>Method and evidence</h1>
<p class="muted">What this page practises, how close it is to the real tests, and what the research says about before/after designs. Full reports with every source are in the project files: <span class="mono">iq-training/research/batteries.md</span> and <span class="mono">iq-training/research/practice-effects.md</span>.</p>

<h2 id="items">1. No real test items</h2>
<p>Every item here is generated from a seed by original code. Nothing is copied from the WAIS, WASI, Stanford-Binet, Raven's, ICAR or any other test. The generators follow the <b>published format</b> and the <b>documented difficulty rules</b> of each task type. This matters for the paper's validity and for ethics:</p>
${li([
  "APA Ethics Code Standard 9.11 asks psychologists to protect the security of test materials, and the ITC guidelines warn against coaching on real test materials.",
  "Norm-referenced scores assume people meet the items for the first time. Practising the real items would turn a test score into a memory score.",
  "ICAR items are distributed for scientific use and should not be republished or used for training. Use them only as outcomes.",
])}

<h2 id="batteries">2. The batteries these tasks follow</h2>
<p><b>WAIS-5</b> (Pearson, 2024): 20 subtests, standardised on 2,020 people aged 16 to 90. Five primary indexes of two subtests each: Verbal Comprehension (Similarities, Vocabulary), Visual Spatial (Block Design, Visual Puzzles), Fluid Reasoning (Matrix Reasoning, Figure Weights), Working Memory (Digit Sequencing, Running Digits) and Processing Speed (Coding, Symbol Search). The <b>FSIQ uses seven</b>: Similarities, Vocabulary, Block Design, Matrix Reasoning, Figure Weights, Digit Sequencing and Coding. About 45 minutes for the FSIQ. New subtests: Running Digits, Set Relations, Naming Speed Quantity, Symbol Span and Spatial Addition.</p>
<p><b>Scores:</b> raw scores become age-normed scaled scores (mean 10, SD 3), which are summed into index and FSIQ scores (mean 100, SD 15). FSIQ reliability is about .97, with a standard error of measurement of about 3 points. The norm tables are not public, so this page shows <b>raw scores only</b> and never an IQ.</p>
<p><b>Timing and stop rules</b> for the WAIS-5 are not published. Where a task here uses time limits, they are the <b>WAIS-IV</b> ones reported in public sources: Block Design 30/60/120 s, Visual Puzzles 20/30 s, Figure Weights 20/40 s, Arithmetic 30 s, Coding and Symbol Search 120 s, digits at one per second. Matrix Reasoning has no strict limit (about 30 s guide).</p>
<div class="tscroll"><table>
<tr><th>Task here</th><th>Real subtest</th><th>Closeness</th></tr>
<tr><td>Matrix Reasoning</td><td>WAIS MR, Raven's</td><td>Same format and rule types; 8 choices like the APM</td></tr>
<tr><td>Figure Weights</td><td>WAIS FW</td><td>Same format and time limits</td></tr>
<tr><td>Visual Puzzles</td><td>WAIS VP</td><td>Same format and time limits; grid-based shapes</td></tr>
<tr><td>Block Design</td><td>WAIS BD</td><td>On screen, not real cubes: motor demand differs</td></tr>
<tr><td>Digits Forward / Backward / Sequencing, Letter-Number</td><td>WAIS digit tasks, LN</td><td>Same rules; shown on screen (sound optional), answered by keypad, not spoken</td></tr>
<tr><td>Running Digits, Symbol Span, Spatial Addition</td><td>WAIS-5 new subtests</td><td>Format from public descriptions; rules not public</td></tr>
<tr><td>Arithmetic</td><td>WAIS AR</td><td>Same timing; text by default, spoken with the setting on</td></tr>
<tr><td>Coding, Symbol Search, Naming Speed Quantity</td><td>WAIS PSI subtests</td><td>Tapped instead of drawn or spoken: speeds are not comparable</td></tr>
<tr><td>Similarities, Vocabulary</td><td>WAIS VCI</td><td>Typed instead of spoken; examiner scoring replaced by self-scoring or blind rating</td></tr>
<tr><td>Number &amp; Letter Series</td><td>ICAR letter-number series</td><td>Same type, original items</td></tr>
</table></div>
<p class="small muted">Not covered: Set Relations (only a one-line public description exists), Information and Comprehension (pure knowledge items; practising them would mean teaching answers).</p>

<h2 id="matrices">3. How the matrices are built</h2>
<p>Carpenter, Just and Shell (1990) found that Raven's items use five rules, and that the number of rules in an item explained about 57% of the variance in error rates (16% errors with one rule, 59% with three or four). The generator uses the same rules on shape, size, shading, turn, number, position and line overlays, with 12 levels from one rule to five. Wrong choices use attribute bisection as in the I-RAVEN data set (Hu et al. 2021): each feature of the answer appears in exactly half of the eight choices, which removes the shortcut of picking the most common features. Every form of every task is checked by an automatic test for a single right answer.</p>

<h2 id="practice">4. Practice effects: what to expect</h2>
<div class="tscroll"><table>
<tr><th>Effect</th><th>Size</th><th>Source</th></tr>
<tr><td>Retesting alone, 1st → 2nd test</td><td>0.33 SD (alternate forms 0.23, identical 0.37)</td><td>Scharfen, Peters &amp; Holling 2018 (122 studies)</td></tr>
<tr><td>Retesting, 1st → 3rd test</td><td>0.50 SD; levels off after that</td><td>Scharfen et al. 2018</td></tr>
<tr><td>Practice plus coaching</td><td>δ = 0.70 (0.24 without)</td><td>Hausknecht et al. 2007</td></tr>
<tr><td>WAIS FSIQ, retest at about one month</td><td>WAIS-IV +3.9 to +5.0 points; WAIS-5 +2.3 to +3.7</td><td>Winter, Trudel &amp; Kaufman 2024, from the manuals</td></tr>
<tr><td>Which subtests gain most</td><td>Processing speed and perceptual reasoning most, verbal least</td><td>WISC-IV retest data; WAIS-IV reviews</td></tr>
<tr><td>Strategy change on Raven's</td><td>Explains about one third of retest gains</td><td>Hayes, Petrov &amp; Sederberg 2015</td></tr>
<tr><td>Training the hard matrix rules</td><td>d ≈ 0.39 vs no training</td><td>Krautter et al. 2021</td></tr>
</table></div>
<p><b>Are the gains real?</b> The more a subtest measures general intelligence (g), the less it gains on retest (r = −.80; te Nijenhuis, van Vianen &amp; van der Flier 2007). Retest scores also lose measurement invariance: the gains sit in test-specific skills, not in the latent ability (Lievens et al. 2007; Estrada et al. 2015).</p>
<p><b>Does brain training raise IQ?</b> Working-memory (n-back) training shows g = 0.44 against passive controls but only 0.06 against active controls (Au et al. 2015); about 0.05 on nonverbal ability against treated controls (Melby-Lervåg, Redick &amp; Hulme 2016); and about zero far transfer once placebo and publication bias are handled (Sala et al. 2019). Recruiting people with “brain training raises IQ” adverts alone produced d ≈ 1 after one hour of training (Foroughi et al. 2016). For scale, a real environmental effect: each extra year of education adds about 1 to 5 IQ points (Ritchie &amp; Tucker-Drob 2018).</p>

<h2 id="design">5. Designing the before/after study</h2>
<p><b>Expected results to state in advance:</b> retest-only about +0.25 to 0.35 SD on alternate forms; training on the trained formats about +0.5 to 0.7 SD; training versus an active control on untrained reasoning tests about 0 to 0.1 SD.</p>
${li([
  "<b>Three arms:</b> training on this site; an <b>active control</b> with the same schedule, screen time and feedback but non-reasoning content (this site has a visual search control task for that); and a <b>retest-only</b> control. Without a control that also retests, any gain is mostly the practice effect.",
  "<b>Double baseline:</b> two tests before training (forms counterbalanced) give each person's own practice effect and the test-retest correlation. Then a post-test and a follow-up about 6 months later.",
  "<b>Alternate forms, counterbalanced.</b> Forms A to D here are built with the same levels and rule types but are <b>not empirically equated</b>; counterbalance their order across people (study mode does this from the participant code).",
  "<b>Outcomes that were not trained.</b> Training items must never be the outcome items. Use ICAR (ICAR-16 correlates .81 with WAIS-IV FSIQ, Young &amp; Keith 2020; use the total score), a disjoint matrix set (MaRs-IB, CC BY 4.0) as near transfer, and a reasoning format the training group never saw as far transfer. This site's standard forms are best used as the <b>trained-format</b> measure.",
  "<b>Neutral recruitment</b> (“a study of puzzle solving”) and a measure of expectations; ask at the end which group people think they were in.",
  "<b>Analysis:</b> ANCOVA or a mixed model (post ~ arm + baseline); an equivalence test (TOST) for far transfer with bounds of ±0.20 SD (about 3 IQ points); measurement invariance across time; practice-adjusted Reliable Change (Chelune et al. 1993) or regression-based change from the retest-only arm, which also handles regression to the mean.",
  "<b>Sample size:</b> d = 0.30 needs about 176 per arm with a plain comparison, or about 120 per arm with ANCOVA at a pre-post correlation of .7 (90% power). Plan about 150 randomised per arm.",
  "<b>If a Wechsler test is an outcome:</b> it needs a qualified examiner (the WAIS-5 is a Pearson level C product), people tested in the last 12 months should be excluded, and the consent form should say that taking it can invalidate a clinical Wechsler assessment for about a year.",
  "<b>Debrief</b> that score gains after practice do not mean intelligence changed, and never hand out IQ-style numbers.",
])}
<p><b>Reliable Change Index</b> (Jacobson &amp; Truax 1991): SE<sub>diff</sub> = SD₁ × √2 × √(1 − r<sub>xx</sub>); RCI = (post − pre) / SE<sub>diff</sub>; |RCI| &gt; 1.96 is reliable change at 95%. For the practice-adjusted version, subtract the mean gain of the retest-only group from (post − pre) first.</p>

<h2 id="data">6. Data this page records</h2>
<p>Every item: task, form, level, response, right or wrong, points, response time in ms, and whether time ran out. Every session: start and end time, settings, participant code and phase. Study mode exports a JSON file and a trial-level CSV. Data stays in the browser until exported; use participant codes, not names (GDPR).</p>

<h2 id="refs">7. Key references</h2>
<ul class="refs">
<li>Au, J. et al. (2015). Improving fluid intelligence with training on working memory: a meta-analysis. <i>Psychonomic Bulletin &amp; Review</i>, 22, 366–377.</li>
<li>Carpenter, P. A., Just, M. A. &amp; Shell, P. (1990). What one intelligence test measures: a theoretical account of the processing in the Raven Progressive Matrices Test. <i>Psychological Review</i>, 97, 404–431.</li>
<li>Chelune, G. J. et al. (1993). Individual change after epilepsy surgery: practice effects and base-rate information. <i>Neuropsychology</i>, 7, 41–52.</li>
<li>Chierchia, G. et al. (2019). The matrix reasoning item bank (MaRs-IB). <i>Royal Society Open Science</i>, 6, 190232.</li>
<li>Condon, D. M. &amp; Revelle, W. (2014). The International Cognitive Ability Resource. <i>Intelligence</i>, 43, 52–64.</li>
<li>Estrada, E. et al. (2015). A general factor of intelligence fails to account for changes in tests' scores after cognitive practice. <i>Intelligence</i>, 50, 93–99.</li>
<li>Foroughi, C. K. et al. (2016). Placebo effects in cognitive training. <i>PNAS</i>, 113, 7470–7474.</li>
<li>Hausknecht, J. P. et al. (2007). Retesting in selection: a meta-analysis of coaching and practice effects. <i>Journal of Applied Psychology</i>, 92, 373–385.</li>
<li>Hayes, T. R., Petrov, A. A. &amp; Sederberg, P. B. (2015). Do we really become smarter when our fluid-intelligence test scores improve? <i>Intelligence</i>, 48, 1–14.</li>
<li>Hu, S. et al. (2021). Stratified rule-aware network for abstract visual reasoning (I-RAVEN). <i>AAAI</i>, 35, 1567–1574.</li>
<li>Jacobson, N. S. &amp; Truax, P. (1991). Clinical significance. <i>Journal of Consulting and Clinical Psychology</i>, 59, 12–19.</li>
<li>Krautter, K. et al. (2021). Test preparation in figural matrices tests: focus on the difficult rules. <i>Frontiers in Psychology</i>, 12, 619440.</li>
<li>Matzen, L. E. et al. (2010). Recreating Raven's: software for systematically generating large numbers of Raven-like matrix problems. <i>Behavior Research Methods</i>, 42, 525–541.</li>
<li>Melby-Lervåg, M., Redick, T. S. &amp; Hulme, C. (2016). Working memory training does not improve performance on measures of intelligence or other measures of “far transfer”. <i>Perspectives on Psychological Science</i>, 11, 512–534.</li>
<li>Ritchie, S. J. &amp; Tucker-Drob, E. M. (2018). How much does education improve intelligence? A meta-analysis. <i>Psychological Science</i>, 29, 1358–1369.</li>
<li>Sala, G. et al. (2019). Near and far transfer in cognitive training: a second-order meta-analysis. <i>Collabra: Psychology</i>, 5, 18.</li>
<li>Scharfen, J., Peters, J. M. &amp; Holling, H. (2018). Retest effects in cognitive ability tests: a meta-analysis. <i>Intelligence</i>, 67, 44–66.</li>
<li>te Nijenhuis, J., van Vianen, A. E. M. &amp; van der Flier, H. (2007). Score gains on g-loaded tests: no g. <i>Intelligence</i>, 35, 283–300.</li>
<li>Winter, Trudel &amp; Kaufman (2024). <i>Journal of Intelligence</i>, 12(11), 118 (WAIS-5 overview and manual data).</li>
<li>Young, S. R. &amp; Keith, T. Z. (2020). An examination of the convergent validity of the ICAR16 and WAIS-IV. <i>Journal of Psychoeducational Assessment</i>, 38, 1052–1059.</li>
</ul>
<p class="small muted">Some page numbers and DOIs still need checking against the originals before submission; the research reports list which.</p>
`;
})();
