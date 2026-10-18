/* Cognitive test practice: the verbal tasks. In the real batteries an examiner writes down the
   spoken answer and scores it 2, 1 or 0 against a scoring guide. Here the person types an answer;
   in practice they then compare it with sample answers at each point level and score themselves.
   Under standard rules nothing is shown and the typed answers go into the export, so a rater who
   does not know the group or the phase can score them blind.
   All word pairs and words are original choices, not items from any published test. */
(function () {
  "use strict";
  const { esc, $, $$ } = window.IQUI;
  // [first, second, 2-point sample, 1-point sample, 0-point sample]; roughly easy to hard
  const PAIRS = [
    ["spoon", "fork", "Both are utensils for eating.", "Both are in the kitchen.", "A fork has points."],
    ["shirt", "sock", "Both are clothing.", "You put them on.", "Socks go on feet."],
    ["hammer", "saw", "Both are tools.", "Both are in a toolbox.", "One cuts, one hits."],
    ["trumpet", "drum", "Both are musical instruments.", "Both make noise.", "A drum is round."],
    ["eagle", "sparrow", "Both are birds.", "Both have feathers.", "Eagles are bigger."],
    ["carrot", "potato", "Both are vegetables.", "Both grow in the ground.", "Carrots are orange."],
    ["bus", "train", "Both are means of transport.", "Both have seats.", "Trains run on rails."],
    ["copper", "iron", "Both are metals.", "Both are hard.", "Copper is reddish."],
    ["inch", "meter", "Both are units of length.", "You measure with them.", "A meter is longer."],
    ["lake", "ocean", "Both are bodies of water.", "You can swim in them.", "The ocean is salty."],
    ["anger", "joy", "Both are emotions.", "You can see them on a face.", "One is good, one is bad."],
    ["thermometer", "scale", "Both are measuring instruments.", "Both have numbers.", "One is for fever."],
    ["elbow", "knee", "Both are joints.", "Both bend.", "The knee is lower."],
    ["letter", "telephone", "Both are means of communication.", "You use them to reach people.", "A letter is slow."],
    ["bridge", "tunnel", "Both are structures that let you get past an obstacle.", "Cars use them.", "A tunnel is dark."],
    ["seed", "infant", "Both are early stages of a living thing.", "Both are small.", "A baby cries."],
    ["river", "artery", "Both are channels that carry a flow.", "Both are long.", "Rivers have fish."],
    ["law", "custom", "Both are rules that guide how people behave.", "People follow them.", "Laws are written down."],
    ["wheel", "lever", "Both are simple machines that make work easier.", "Both help you move things.", "A wheel is round."],
    ["hunger", "thirst", "Both are body signals of a need.", "Both feel bad.", "You eat or drink."],
    ["microscope", "telescope", "Both are optical instruments that let you see what the eye cannot.", "Both have lenses.", "One is for stars."],
    ["vote", "protest", "Both are ways citizens express political views.", "People do them.", "Voting is in a booth."],
    ["rust", "decay", "Both are gradual breakdowns by chemical or natural processes.", "Things get ruined.", "Rust is orange."],
    ["compass", "clock", "Both are instruments that orient you (in direction, in time).", "Both have hands or needles.", "A clock ticks."],
    ["map", "model", "Both are simplified representations of something real.", "You look at them.", "Maps are flat."],
    ["question", "hypothesis", "Both are starting points of inquiry that are then tested or answered.", "Both are used in science.", "You ask a question."],
    ["melody", "sentence", "Both are ordered sequences that follow rules to carry meaning.", "You can sing or say them.", "A melody is music."],
    ["prison", "quarantine", "Both are forms of enforced isolation.", "You cannot leave.", "Prison is for criminals."],
    ["money", "language", "Both are shared symbol systems that work because people agree on them.", "People use them every day.", "Money is paper."],
    ["inflation", "erosion", "Both are gradual losses over time (of value, of material).", "Both are bad.", "Erosion is by water."],
    ["habit", "reflex", "Both are responses that happen without deliberate thought.", "You do them.", "A reflex is fast."],
    ["fossil", "memory", "Both are traces that preserve the past.", "Both are old.", "Fossils are stone."],
    ["contract", "promise", "Both are commitments to a future action.", "People make them.", "Contracts are signed."],
    ["echo", "reflection", "Both are a wave sent back from a surface (sound, light).", "Both repeat something.", "An echo is loud."],
    ["vaccine", "rehearsal", "Both prepare you for the real thing by exposure to a safe version of it.", "Both get you ready.", "A vaccine is a shot."],
    ["tax", "rent", "Both are regular payments for using something you do not own outright.", "Both cost money.", "Rent is for a flat."],
    ["camouflage", "lie", "Both are forms of deception.", "Both hide things.", "Animals use camouflage."],
    ["evolution", "market", "Both are systems where order comes from selection and competition without a planner.", "Both change over time.", "Markets sell food."],
    ["silence", "zero", "Both are an absence that still counts as a meaningful value.", "Both are nothing.", "Zero is a number."],
    ["thunder", "applause", "Both are loud sounds made in response to an event.", "Both are noisy.", "Thunder is scary."],
    ["salt", "sugar", "Both are crystalline substances used to season food.", "Both are white.", "Sugar is sweet."],
    ["novel", "newspaper", "Both are written texts for reading.", "Both have pages.", "A novel is long."],
    ["copy", "translation", "Both reproduce an original in another instance or form.", "Both are like the first one.", "A copy is from a machine."],
    ["fever", "alarm", "Both are warning signals that something is wrong.", "Both are unpleasant.", "An alarm rings."],
    ["anchor", "habit", "Both hold something in place and resist change.", "Both are hard to move.", "Anchors are heavy."],
  ];
  // [word, 2-point sample, 1-point sample]
  const WORDS = [
    ["kettle", "A pot for boiling water.", "A kitchen thing."], ["ladder", "A set of rungs you climb to reach high places.", "Something to stand on."], ["borrow", "To take something with the promise of giving it back.", "To get something."],
    ["island", "Land surrounded by water.", "A place in the sea."], ["recipe", "Instructions for preparing a dish.", "Cooking."], ["whisper", "To speak very softly, under the breath.", "Talking."],
    ["harvest", "Gathering ripe crops.", "Farm work."], ["journey", "Travel from one place to another.", "Going somewhere."], ["polite", "Showing good manners and respect.", "Nice."],
    ["shelter", "A place that protects from weather or danger.", "A house."], ["fragile", "Easily broken.", "Glass."], ["rescue", "To save from danger.", "Help."],
    ["ancient", "Very old, from a long time ago.", "Pyramids."], ["curious", "Eager to know or learn.", "Asking things."], ["gather", "To bring together into one place.", "Pick up."],
    ["reluctant", "Unwilling, hesitant to do something.", "Not happy."], ["abundant", "Existing in large amounts, plentiful.", "A lot of food."], ["conceal", "To hide, keep from being seen.", "Keep."],
    ["frugal", "Careful not to waste money or resources.", "Cheap."], ["candid", "Frank and honest, saying what you think.", "Talks a lot."], ["meticulous", "Very careful and precise about details.", "Good at work."],
    ["ambiguous", "Open to more than one meaning.", "Confusing."], ["dwindle", "To shrink gradually.", "Go away."], ["hinder", "To get in the way of, make harder.", "Stop."],
    ["lenient", "Not strict; tolerant in punishing.", "Kind."], ["obsolete", "No longer used, out of date.", "Old."], ["resilient", "Able to recover quickly from difficulty.", "Strong."],
    ["scrutinize", "To examine very closely.", "Look at."], ["tedious", "Long and boring.", "Hard."], ["vindicate", "To clear of blame or show to be right.", "Win."],
    ["ephemeral", "Lasting a very short time.", "Not real."], ["obfuscate", "To make deliberately unclear.", "Hide."], ["laconic", "Using very few words.", "Quiet."],
    ["sanguine", "Optimistic, especially in a difficult situation.", "About blood."], ["perfunctory", "Done as a routine, with little care or interest.", "Done fast."], ["recalcitrant", "Stubbornly refusing to obey or cooperate.", "Bad."],
    ["pusillanimous", "Lacking courage, timid.", "Weak."], ["obsequious", "Too eager to please or obey.", "Polite."], ["intransigent", "Refusing to change one's position.", "Strict."],
    ["ineffable", "Too great or extreme to be expressed in words.", "Very special."], ["sycophant", "A person who flatters powerful people for gain.", "A fan."], ["propitiate", "To win or regain someone's favor by pleasing them.", "Make happy."],
    ["abstruse", "Difficult to understand, obscure.", "Odd."], ["pellucid", "Translucently clear; easy to understand.", "Shiny."], ["apocryphal", "Of doubtful truth, though widely told.", "From the Bible."],
  ];
  // forms share the difficulty curve: item i goes to form i mod 3
  const formItems = (bank, form) => bank.filter((_, i) => i % 3 === "ABC".indexOf(form));

  function selfTask(id, name, bank, kind) {
    const isSim = kind === "sim";
    return {
      id, name, index: "verbal", tag: "WAIS-5 VCI · FSIQ",
      short: isSim ? "Say how two things are alike, as abstractly as you can." : "Say what a word means.",
      models: isSim ? "Similarities (WAIS-5, WAIS-IV, WASI-II)" : "Vocabulary (WAIS-5, WAIS-IV, WASI-II)",
      admin: { kind: "self", text: `15 items per form, typed answers. Practice: compare with sample answers and score yourself 2, 1 or 0. Standard rules: no feedback; the typed answers are exported for blind scoring by a rater.${isSim ? "" : " In English: give a native-language test for a real study."}` },
      async run(task, mode, form, nPractice) {
        const items = mode === "test" ? formItems(bank, form) : bank.slice().sort(() => Math.random() - 0.5).slice(0, nPractice || 12);
        const out = [];
        let quit = false;
        $("#quit").onclick = () => { quit = true; location.hash = "#/task/" + id; };
        $("#tb").classList.add("off");
        for (let i = 0; i < items.length && !quit; i++) {
          const it = items[i];
          $("#qn").textContent = `${i + 1} / ${items.length}`;
          const q = isSim ? `In what way are <b>${esc(it[0].toUpperCase())}</b> and <b>${esc(it[1].toUpperCase())}</b> alike?` : `What does <b>${esc(it[0].toUpperCase())}</b> mean?`;
          const host = $("#stage");
          host.innerHTML = `<div class="stim"><p style="font-size:1.25rem;text-align:center;margin:10px">${q}</p></div><textarea id="ans" rows="3" style="max-width:none" aria-label="Your answer"></textarea><div class="next"><button class="btn go" type="button" id="ok">Answer</button></div>`;
          $("#ans").focus();
          const t0 = performance.now();
          const text = await new Promise(r => { $("#ok").onclick = () => r($("#ans").value.trim()); });
          if (quit) return null;
          const rt = Math.round(performance.now() - t0);
          let points = null;
          if (mode !== "test") {
            host.innerHTML += "";
            $("#fb").innerHTML = `<div class="feedback card"><p class="small muted">Your answer: “${esc(text || "(blank)")}”</p><p><b>2 points</b>, e.g. ${esc(isSim ? it[2] : it[1])}</p><p><b>1 point</b>, e.g. ${esc(isSim ? it[3] : it[2])}</p>${isSim ? `<p><b>0 points</b>, e.g. ${esc(it[4])}</p>` : "<p><b>0 points</b>: wrong, or no sign of knowing the meaning.</p>"}<p class="small muted">${isSim ? "Two points go to the most general category or the essential shared property. A true but minor or concrete likeness earns one; a difference earns none." : "Two points go to a good synonym, the main use, or the defining feature. A vague, minor or example-only answer earns one."}</p><p><b>Score your answer:</b></p><div class="btns">${[2, 1, 0].map(p => `<button class="btn" type="button" data-p="${p}">${p}</button>`).join("")}</div></div>`;
            points = await new Promise(r => $$("#fb [data-p]").forEach(b => b.onclick = () => r(+b.dataset.p)));
            $("#fb").innerHTML = "";
          }
          out.push({ level: i + 1, item: isSim ? it[0] + "/" + it[1] : it[0], response: text, rt, points, correct: points === null ? null : points > 0 });
        }
        return { items: out, raw: mode === "test" ? "to score" : out.reduce((s, x) => s + (x.points || 0), 0), max: out.length * 2, selfScored: mode !== "test" };
      },
    };
  }
  window.IQCONTENT = window.IQCONTENT || {};
  window.IQCONTENT.verbal = { similar: selfTask("similar", "Similarities", PAIRS, "sim"), vocab: selfTask("vocab", "Vocabulary", WORDS, "voc") };
})();
