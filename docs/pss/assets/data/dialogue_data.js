// Park Street Survivor — Narrative Data (Node-based Engine v2)
// ─────────────────────────────────────────────────────────────────────────────
// Each entry is a dialogue node addressed by a unique string ID.
//
// Fields:
//   speaker   — display name shown in the name box
//   portrait  — portrait key; resolvePortraitBySpeaker() applies as fallback
//   bg        — background scene hint for the cutscene renderer
//   content   — text segments (each string ≤ 3 rendered lines)
//               Use <h>word</h> to render that word in gold highlight
//   sfx       — optional sound-effect ID fired when this node activates
//   next_id   — ID of the next node (omit on branch nodes or sequence end)
//   options   — branch choices: [{ label, next_id? | action? }]
//   event     — engine event fired alongside this node (e.g. "notice_box")
//   item_id   — item name matching InventorySystem / BackpackVisual IDs
//               notice_box layout: 520×150 px at (1400, 100),
//               light-purple item frame 104×112 px, item image centred inside
// ─────────────────────────────────────────────────────────────────────────────

const DIALOGUE_DATA = {

// ═══════════════════════════════════════════════════════════════════════════
// PROLOGUE — Breaking news broadcast
// ═══════════════════════════════════════════════════════════════════════════

prologue_01: {
    speaker: "NEWSREADER", portrait: "newsreader_normal", bg: "news_broadcast",
    sfx: "news_jingle",
    loop_sfx: "ambulance",
    content: ["BREAKING NEWS"],
    next_id: "prologue_02"
},
prologue_02: {
    speaker: "NEWSREADER", portrait: "newsreader_normal", bg: "news_broadcast",
    content: ["An unexpected <h>car crash</h> has just taken place,",
              "causing a major blockage near Blackfriars Underpass.",],
    next_id: "prologue_03"
},
prologue_03: {
    speaker: "NEWSREADER", portrait: "newsreader_normal", bg: "news_broadcast",
    content: ["We have been informed by the Metropolitan Police that <h>a woman</h>,",
              "believed to be in her late 20s, was struck by a car shortly after 18:00 this evening"],
    next_id: "prologue_04"
},
prologue_04: {
    speaker: "NEWSREADER", portrait: "newsreader_normal", bg: "news_broadcast",
    content: ["Emergency services have rushed her to the hospital in critical condition.",],
    next_id: "prologue_05"
},
prologue_05: {
    speaker: "NEWSREADER", portrait: "newsreader_normal", bg: "news_broadcast",
    content: ["According to current updates, the circumstances of the accident remain <h>unclear</h>,",
              "and several witnesses claim the woman may have acted <h>intentionally</h>."],
    next_id: "prologue_06"
},
prologue_06: {
    speaker: "NEWSREADER", portrait: "newsreader_normal", bg: "news_broadcast",
    sfx: "news_silence",
    content: ["Exact circumstances are yet to be established…"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 1 ROOM — Iris wakes up (sunny, optimistic)
// ═══════════════════════════════════════════════════════════════════════════

day1_room_01: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    sfx: "alarm_buzz",
    content: ["8:00 o'clock already?!"],
    next_id: "day1_room_02"
},
day1_room_02: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    content: ["That was the <h>best sleep</h> I've had for a long time"],
    next_id: "day1_room_03"
},
day1_room_03: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    content: ["My neck does feel a little stiff though…why is that?"],
    next_id: "day1_room_04"
},
day1_room_04: {
    speaker: "IRIS", portrait: "iris_happy", bg: "room_morning",
    content: ["Never mind, the weather is truly <h>sunny</h> today, can't let such a day go to waste!"],
    next_id: "day1_room_05"
},
day1_room_05: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    content: ["Just need to grab some things before I'm off"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 2 ROOM — Sore body, GAIL's treat
// ═══════════════════════════════════════════════════════════════════════════

day2_room_01: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning",
    sfx: "alarm_buzz",
    content: ["Hmm time to get up again.."],
    next_id: "day2_room_02"
},
day2_room_02: {
    speaker: "IRIS", portrait: "iris_happy", bg: "room_morning",
    content: ["Wow, and the weather is <h>still bright</h>!"],
    next_id: "day2_room_03"
},
day2_room_03: {
    speaker: "IRIS", portrait: "iris_happy", bg: "room_morning",
    content: ["Perhaps I can even make a quick stop at GAIL'S and buy myself an iced matcha!"],
    next_id: "day2_room_04"
},
day2_room_04: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning",
    content: ["There is only one problem…."],
    next_id: "day2_room_05"
},
day2_room_05: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning",
    content: ["My body still feels so <h>sore</h>, could it really be after climbing that hill?"],
    next_id: "day2_room_06"
},
day2_room_06: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    content: ["Never mind, the first day is always the worst.."],
    next_id: "day2_room_07"
},
day2_room_07: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    content: ["Surely my body will get used to it."],
    next_id: "day2_room_08"
},
day2_room_08: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning",
    content: ["Better grab my things and go!"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 3 ROOM — Fatigue, grey weather
// ═══════════════════════════════════════════════════════════════════════════

day3_room_01: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning",
    sfx: "alarm_faint",
    content: ["Why do I feel like the alarm sounds even more <h>vague</h>?"],
    next_id: "day3_room_02"
},
day3_room_02: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning",
    content: ["I barely heard it this morning…"],
    next_id: "day3_room_03"
},
day3_room_03: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning",
    content: ["Maybe my tiredness, is really getting to me…"],
    next_id: "day3_room_04"
},
day3_room_04: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_cloudy",
    content: ["Damn… and here we go back to the standard <h>gloomy</h> weather"],
    next_id: "day3_room_05"
},
day3_room_05: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_cloudy",
    content: ["I only hope it just doesn't rain…."],
    next_id: "day3_room_06"
},
day3_room_06: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_cloudy",
    content: ["Each day seems to be worse than the other, I don't smoke or drink… or even go clubbing,",
              "why is my body this <h>weak</h>…"],
    next_id: "day3_room_07"
},
day3_room_07: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning_cloudy",
    content: ["Anyway, lets grab some things and go"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 4 ROOM — Hallucinations, rain, trembling
// ═══════════════════════════════════════════════════════════════════════════

day4_room_01: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    loop_sfx: "heartbeat_short",
    content: ["What is that sound? It's not my phone…"],
    next_id: "day4_room_02"
},
day4_room_02: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    stop_sfx: "heartbeat_short",
    content: ["It sounds like a….. <h>heart monitor</h>? So strange…"],
    next_id: "day4_room_03"
},
day4_room_03: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["It must all just be in my head.",
              "And the room… It feels so <h>cold</h>….."],
    next_id: "day4_room_04"
},
day4_room_04: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["I really wish I don't have to go to Uni.",
              "My legs are <h>trembling</h> and I can barely stand"],
    next_id: "day4_room_05"
},
day4_room_05: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["Great! And its <h>pouring</h> outside…",
              "As if things couldn't get any worse…"],
    next_id: "day4_room_06"
},
day4_room_06: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["I guess the only good thing right now are my friends,",
              "no matter how bad the days seem, they always lift up my spirits…"],
    next_id: "day4_room_07"
},
day4_room_07: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["I truly hope we can <h>stay in touch</h> in the future…",
              "such good friends only come by once in a lifetime"],
    next_id: "day4_room_08"
},
day4_room_08: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["only with them, I feel that I can handle all my problems",
              "It's almost the <h>weekend</h>… maybe I can try pull through these last few days"],
    next_id: "day4_room_09"
},
day4_room_09: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning_rainy",
    content: ["Let's get going"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 5 ROOM — Crisis, perpetual loop
// ═══════════════════════════════════════════════════════════════════════════

day5_room_01: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["UUUUUGGGHHHH……."],
    next_id: "day5_room_02"
},
day5_room_02: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["I couldn't breathe again"],
    next_id: "day5_room_03"
},
day5_room_03: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["That dream…it was so god damn <h>real</h>….again it was us at the <h>balloon fiesta</h>….",
              "but this time we all……<h>died</h>…"],
    next_id: "day5_room_04"
},
day5_room_04: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "room_morning_rainy",
    content: ["How could anyone make any sense of this?",
              "I wonder why I am being constantly pulled to that memory.."],
    next_id: "day5_room_05"
},
day5_room_05: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["Perhaps because it was one of the happiest moments of my life…",
              "one in which I find reassurance and comfort"],
    next_id: "day5_room_06"
},
day5_room_06: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["Where my friends are my truest source of happiness…"],
    next_id: "day5_room_07"
},
day5_room_07: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning_rainy",
    content: ["Apart from being stuck in this perpetual loop of weird events,",
              "and my body <h>sabotaging</h> itself… I actually feel fulfilled with my life…"],
    next_id: "day5_room_08"
},
day5_room_08: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning_rainy",
    content: ["My friends, studying for my dream career and being passionate about my goals….",
              "inevitably it's what <h>keeps me alive</h>"],
    next_id: "day5_room_09"
},
day5_room_09: {
    speaker: "IRIS", portrait: "iris_normal", bg: "room_morning_rainy",
    content: ["I will always cherish these years at Uni"],
    next_id: "day5_room_10"
},
day5_room_10: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["Unfortunately today, It <h>rains</h> again,",
              "but I promised Charlotte that I will meet her today…"],
    next_id: "day5_room_11"
},
day5_room_11: {
    speaker: "IRIS", portrait: "iris_tired", bg: "room_morning_rainy",
    content: ["Come on Iris...lets do this <h>one last time</h>"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 1 NPC — WIOLA: OOD intro, memory branch, vitamin gummies
// Shared: 01→02→03→04→05→06→07→08→09(branch)
//   Branch A (Continue): a01→…→a08(showcase)→gift_01→gift_02
//   Branch B (Remember): b01→…→b13(showcase)→b_gift→gift_02
// ═══════════════════════════════════════════════════════════════════════════

day1_npc_01: {
    speaker: "WIOLA", portrait: "wiola_happy",
    sfx: "meeting_chime",
    content: ["Heyy Iris! Long time no see!"],
    next_id: "day1_npc_02"
},
day1_npc_02: {
    speaker: "IRIS", portrait: "iris_normal",
    content: ["……Wiola….Hi, it is nice to see you!"],
    next_id: "day1_npc_03"
},
day1_npc_03: {
    speaker: "WIOLA", portrait: "wiola_normal",
    content: ["I see, have you prepared for today's software engineering lab?"],
    next_id: "day1_npc_04"
},
day1_npc_04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["What! That's today? Oh no, you're right. I completely forgot…"],
    next_id: "day1_npc_05"
},
day1_npc_05: {
    speaker: "WIOLA", portrait: "wiola_normal",
    content: ["No worries, Luckily, I've overviewed the contents last night,",
              "It's on object orientated design."],
    next_id: "day1_npc_06"
},
day1_npc_06: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Just sit with me and I'll talk you through it."],
    next_id: "day1_npc_07"
},
day1_npc_07: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Thanks, you've always got my back!"],
    next_id: "day1_npc_08"
},
day1_npc_08: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["It's strange….Weirdly, I <h>can't remember</h> what I was up to last night…",
              "I must've just passed out in sleep."],
    next_id: "day1_npc_09"
},
day1_npc_09: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Something's not adding up….why can't I remember anything?"],
    options: [
        { label: "Continue with the conversation",          next_id: "day1_1_a01" },
        { label: "Try to remember what happened last night", next_id: "day1_1_b01" }
    ]
},

// — Branch A: Continue with the conversation —
day1_1_a01: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Haha you overwork yourself girl…",
              "no one else studies as hard as you..give yourself a break."],
    next_id: "day1_1_a02"
},
day1_1_a02: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["I suppose…If only I could study from home",
              "and didn't have to climb this dreaded hill,"],
    next_id: "day1_1_a02b"
},
day1_1_a02b: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["I would have got my PhD already…"],
    next_id: "day1_1_a03"
},
day1_1_a03: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Hahahha, I believe you."],
    next_id: "day1_1_a04"
},
day1_1_a04: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Well.. at least your daily cardio is out the way.",
              "Such a relief that I live close by."],
    next_id: "day1_1_a05"
},
day1_1_a05: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["JEALOUS!"],
    next_id: "day1_1_a06"
},
day1_1_a06: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Really though…do you have any paracetamol? That would really help.."],
    next_id: "day1_1_a07"
},
day1_1_a07: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["I don't, but I've got something better…"],
    next_id: "day1_1_a08"
},
day1_1_a08: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Recently I bought some <h>vitamin gummies</h> from H&B.",
              "Here, they contain caffeine so it'll wake you up in no time."],
    event: "showcase", item_id: "Soft Gummy Vitamins",
    next_id: "day1_npc_gift_01"
},
day1_npc_gift_01: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Orange flavour, MY FAVOURITE! Thanks!"],
    next_id: "day1_npc_gift_02"
},

// — Branch B: Try to remember what happened last night —
day1_1_b01: {
    speaker: "IRIS", portrait: "iris_normal",
    effect: "blur_on",
    content: ["(Gosh, I really have <h>no recollection</h>….)"],
    next_id: "day1_1_b02"
},
day1_1_b02: {
    speaker: "IRIS", portrait: "iris_normal",
    content: ["(And why did Wiola say \"long time no see\"….",
              "I surely must've seen her last week..)"],
    next_id: "day1_1_b03"
},
day1_1_b03: {
    speaker: "IRIS", portrait: "iris_normal",
    content: ["(Although I <h>can't remember</h>…",
              "I can't even remember last night let alone-)"],
    next_id: "day1_1_b04"
},
day1_1_b04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["(What the hell….think!)"],
    next_id: "day1_1_b05"
},
day1_1_b05: {
    speaker: "WIOLA", portrait: "wiola_happy",
    effect: "blur_off",
    content: ["IRIS~"],
    next_id: "day1_1_b06"
},
day1_1_b06: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["HUh?"],
    next_id: "day1_1_b07"
},
day1_1_b07: {
    speaker: "WIOLA", portrait: "wiola_normal",
    content: ["Are you listening? You <h>zoned out</h>."],
    next_id: "day1_1_b08"
},
day1_1_b08: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["OH! Yes, sorry…just a bit <h>sleepy</h>. What did you say?"],
    next_id: "day1_1_b09"
},
day1_1_b09: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Luckily nothing important, I was just telling you about my new coffee machine…",
              "you have to try my latte!"],
    next_id: "day1_1_b10"
},
day1_1_b10: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["I think you could use one right now…"],
    next_id: "day1_1_b11"
},
day1_1_b11: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["…Oh..haha yes of course. I would kill for a coffee right now…",
              "or in fact anything that could get me up on my feet."],
    next_id: "day1_1_b12"
},
day1_1_b12: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["You're with the right person..I have just the thing for you ;)"],
    next_id: "day1_1_b13"
},
day1_1_b13: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Recently I bought some <h>vitamin gummies</h>.",
              "They're so delicious , and they'll get you through the lecture. Here."],
    event: "showcase", item_id: "Soft Gummy Vitamins",
    next_id: "day1_1_b_gift"
},
day1_1_b_gift: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Wow, cheers orange flavour. MY FAVOURITE!"],
    next_id: "day1_npc_gift_02"
},

// — Shared ending —
day1_npc_gift_02: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["No worries, come on now sleepyhead. We're gonna be late."],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 2 NPC — LAYLA: Ji's Chicken & tangle toy
// Flow: 01→…→12→13(branch)→14→15→…→19(item)→20→21
// ═══════════════════════════════════════════════════════════════════════════

day2_npc_01: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["IRIS! You alright? You look like you just ran a marathon."],
    next_id: "day2_npc_02"
},
day2_npc_02: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["…….H….HI! "],
    next_id: "day2_npc_03"
},
day2_npc_03: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["….I….I….Im still not used to climbing this stupid hill.."],
    next_id: "day2_npc_04"
},
day2_npc_04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Everyday it feels like a torture."],
    next_id: "day2_npc_05"
},
day2_npc_05: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["HAH Park Street is not for the weak!"],
    next_id: "day2_npc_06"
},
day2_npc_06: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Its alright, you're here now. We still have 10 minutes left before class."],
    next_id: "day2_npc_07"
},
day2_npc_07: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["How come you don't take the bus?"],
    next_id: "day2_npc_08"
},
day2_npc_08: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Ohh….well..I <h>don't</h> really have the money for it."],
    next_id: "day2_npc_09"
},
day2_npc_09: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Money is a bit tight these days."],
    next_id: "day2_npc_10"
},
day2_npc_10: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Besides, I guess its good for my health. So its not all that bad."],
    next_id: "day2_npc_11"
},
day2_npc_11: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["I get it, you want to burn off all the Ji's chicken you eat!"],
    next_id: "day2_npc_12"
},
day2_npc_12: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Shhhh! I eat fried chicken with no regrets!"],
    next_id: "day2_npc_13"
},
day2_npc_13: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["hahaha I'm just playing."],
    next_id: "day2_npc_14"
},
day2_npc_14: {
    speaker: "IRIS", portrait: "iris_normal",
    content: ["On a more serious note though…I've been having a <h>strange feeling</h> about something.."],
    next_id: "day2_npc_15"
},
day2_npc_15: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Yeah?….What do you mean by that?"],
    next_id: "day2_npc_16"
},
day2_npc_16: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Something feels off. Tell Layla about:"],
    options: [
        { label: "Your last night's discovery",          next_id: "day2_2_a01" },
        { label: "Things missing from your surroundings", next_id: "day2_2_b01" }
    ]
},

// — Branch A: Last night's discovery —
day2_2_a01: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["I know how it sounds…but yesterday evening, just before sleeping,",
              "I suddenly felt like I <h>dissociated</h> from everything….."],
    next_id: "day2_2_a02"
},
day2_2_a02: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["My body was there..but my mind was reaching out for something else….",
              "something I can't seem to get ahold of."],
    next_id: "day2_2_a03"
},
day2_2_a03: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Like a <h>memory</h>…"],
    next_id: "day2_2_a04"
},
day2_2_a04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["But it was nothing like simple daydreaming. It was so much more <h>intense</h>….",
              "Like my body and time are two <h>separate parallels</h>…"],
    next_id: "day2_2_a05"
},
day2_2_a05: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Wow, that is quite strange…."],
    next_id: "day2_2_a06"
},
day2_2_a06: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["But I wouldn't say…it's that abnormal for you,",
              "with <h>ADHD</h> you never take one thought at a time….more like 10."],
    next_id: "day2_2_a07"
},
day2_2_a07: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["hah, I know but this time-"],
    next_id: "day2_2_a08"
},
day2_2_a08: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["Look, don't worry! I have an easy fix for this."],
    next_id: "day2_2_a09"
},
day2_2_a09: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["As your trusted friend I advise you to focus more on things you enjoy.",
              "Likeee.…video games! You don't always have to be so strict on…timings, deadlines, dates…."],
    next_id: "day2_2_a09b"
},
day2_2_a09b: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["Just take one thing at a take and you'll <h>regain</h> your rhythm."],
    next_id: "day2_2_a10"
},
day2_2_a10: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["I guess you're right."],
    next_id: "day2_2_a11"
},
day2_2_a11: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["When did you become so wise?"],
    next_id: "day2_2_a12"
},
day2_2_a12: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["What do you mean? I've always been!"],
    next_id: "day2_2_a13"
},
day2_2_a13: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Hahaha of course…silly me."],
    next_id: "day2_2_a14"
},
day2_2_a14: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["Look… I have just the thing for you."],
    next_id: "day2_2_a15"
},
day2_2_a15: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["A <h>tangle<h> toy!"],
    event: "showcase", item_id: "Tangle",
    next_id: "day2_npc_gift_a01"
},
day2_npc_gift_a01: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["Its designed for <h>concentration</h> - like a fidget toy.",
              "But unluckily for me, it only makes me more distracted."],
    next_id: "day2_npc_gift_a01b"
},
day2_npc_gift_a01b: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["I believe you will make better use of it."],
    next_id: "day2_npc_gift_a02"
},
day2_npc_gift_a02: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["WOW thanks! It's super cute!"],
    next_id: "day2_npc_gift_a03"
},
day2_npc_gift_a03: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["And trendy!!! Do you know how hard it is to get it in purple colour?!"],
    next_id: "day2_npc_gift_a04"
},
day2_npc_gift_a04: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Wow, I love purple, thanks Layla!"],
    next_id: "day2_npc_gift_a05"
},
day2_npc_gift_a05: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["No probs, lets go. You can try it out in class."],
},

// — Branch B: Things missing from your surroundings —
day2_2_b01: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Within the past two days, I've just been constantly losing things…",
              "my <h>headphones</h>, laptop cable, my favourite mug…even just random objects…"],
    next_id: "day2_2_b02"
},
day2_2_b02: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["But more importantly, my notebook!",
              "It contains all my notes, schedules and upcoming plans.."],
    next_id: "day2_2_b03"
},
day2_2_b03: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["With all this <h>forgetfulness</h>, that is the only thing that could help me make sense of things…",
              "but theres no sign of it.."],
    next_id: "day2_2_b04"
},
day2_2_b04: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Hmmm…did you search your room thoroughly?…"],
    next_id: "day2_2_b05"
},
day2_2_b05: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Of course! I checked every corner of my room and nothing.",
              "I'm convinced they've completely <h>vanished</h>."],
    next_id: "day2_2_b06"
},
day2_2_b06: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Damn that does sound serious…you know…I recently read that people with <h>ADHD</h>",
              "are more at risk of developing <h>Dementia</h>….Do you think-"],
    next_id: "day2_2_b07"
},
day2_2_b07: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["You're not helping Lay…"],
    next_id: "day2_2_b08"
},
day2_2_b08: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Sorry, I will take this with the highest degree of seriousness.",
              "How about I come around on the weekend and we'll look for it together?"],
    next_id: "day2_2_b09"
},
day2_2_b09: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Fine, maybe you'll have a better eye for finding things."],
    next_id: "day2_2_b10"
},
day2_2_b10: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["And…to cheer you up. I've got something for you.."],
    next_id: "day2_2_b11"
},
day2_2_b11: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["A <h>tangle</h>, it's like a fidget toy.",
              "It also helps with <h>concentration</h>. I've had my fun with it already. Here ya go."],
    event: "showcase", item_id: "Tangle",
    next_id: "day2_2_b_gift"
},
day2_2_b_gift: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Looks cool, thanks Lay."],
    next_id: "day2_2_b_gift_02"
},
day2_2_b_gift_02: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["You're welcome….just don't lose it."],
    next_id: "day2_2_b_gift_03"
},
day2_2_b_gift_03: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["So funny, just wait…one day I'm gonna get you back!"],
    next_id: "day2_2_b_gift_04"
},
day2_2_b_gift_04: {
    speaker: "LAYLA", portrait: "layla_happy",
    content: ["I'll be waiting…..come on now, let's head to class."],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 3 NPC — RAYMOND: France trip, dizziness episode, balloon fiesta flashback
// Pre-branch : 01→…→14(BRANCH)
// Option 1   : day3_3_a01→…→a06 → day3_npc_gift_01
// Option 2   : day3_3_b01→…→b24 → day3_npc_gift_01
// Common end : gift_01→…→gift_16
// ═══════════════════════════════════════════════════════════════════════════

day3_npc_01: {
    speaker: "IRIS", portrait: "iris_happy", bg: "library",
    content: ["Hi RAY, so glad to see you"],
    next_id: "day3_npc_02"
},
day3_npc_02: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["Hey Hey!"],
    next_id: "day3_npc_03"
},
day3_npc_03: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Layla told me you'd be coming back from France today,",
              "how was the trip? How was the food?"],
    next_id: "day3_npc_04"
},
day3_npc_04: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["It was so surreal! Romance filled cafés, golden lit Eiffel tower, cultural arts…"],
    next_id: "day3_npc_05"
},
day3_npc_05: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["I could barely bring myself back….And the food…so exquisite and delicious…"],
    next_id: "day3_npc_06"
},
day3_npc_06: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["Im afraid my taste will no longer be able to accept the Tesco meal deals"],
    next_id: "day3_npc_07"
},
day3_npc_07: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Hahaha, I am happy for you, sounds truly like a dreamlike experience"],
    next_id: "day3_npc_08"
},
day3_npc_08: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["Next time I'm bringing you with me, you must experience it for yourself. No excuses"],
    next_id: "day3_npc_09"
},
day3_npc_09: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["I wish for that if…if only—"],
    next_id: "day3_npc_10"
},
day3_npc_10: {
    speaker: "IRIS", portrait: "iris_distressed",
    effect: "dizzy",
    content: ["……………………." ],
    next_id: "day3_npc_11"
},
day3_npc_11: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    effect: "shake",
    content: ["HEY!! IRIS!! Are you alright?!!"],
    next_id: "day3_npc_12"
},
day3_npc_12: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["………"],
    next_id: "day3_npc_13"
},
day3_npc_13: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    effect: "shake",
    content: ["IRIS OMG, WAKE UP!"],
    next_id: "day3_npc_14"
},
day3_npc_14: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["You start to feel <h>dizzy</h> and faint… Your mind is pulling you <h>somewhere</h>.."],
    options: [
        { label: "Wake up",   next_id: "day3_3_a01" },
        { label: "Flashback", next_id: "day3_3_b01" }
    ]
},

// — Option 1: Wake up ────────────────────────────────────────────────────────
day3_3_a01: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    effect: "flash",
    content: ["Ohh…….I'm…I'm alright.."],
    next_id: "day3_3_a02"
},
day3_3_a02: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["I just felt a bit dizzy. No worries, I'll be alright…."],
    next_id: "day3_3_a03"
},
day3_3_a03: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["WHAT!? ARE YOU SURE?"],
    next_id: "day3_3_a04"
},
day3_3_a04: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["You totally <h>passed out</h>!"],
    next_id: "day3_3_a05"
},
day3_3_a05: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["No, no, I think I'm just exhausted…a lot is going on recently…"],
    next_id: "day3_3_a06"
},
day3_3_a06: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["One day, I'll end up on my death bed because of it…"],
    next_id: "day3_npc_gift_01"
},

// — Option 2: Flashback ──────────────────────────────────────────────────────
day3_3_b01: {
    speaker: "", portrait: null, bg: "balloon_festival",
    bgm: "balloon_festival",
    content: ["Location: Ashton Court — Bristol Balloon Fiesta"],
    next_id: "day3_3_b02"
},
day3_3_b02: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Girls come here! It's about to take off!"],
    next_id: "day3_3_b03"
},
day3_3_b03: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["No, no, no, where's Iris!?"],
    next_id: "day3_3_b04"
},
day3_3_b04: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["She should be here any minute, tell the guy to give us two minutes!"],
    next_id: "day3_3_b05"
},
day3_3_b05: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["Gosh, where is sheee? I hope she makes it"],
    next_id: "day3_3_b06"
},
day3_3_b06: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["She just sent a message, she's saying she's gonna be <h>late</h>…"],
    next_id: "day3_3_b07"
},
day3_3_b07: {
    speaker: "LYDIA", portrait: "lydia",
    content: ["What do we do now? Our balloon is about to <h>take off</h>!"],
    next_id: "day3_3_b08"
},
day3_3_b08: {
    speaker: "", portrait: null, bg: "bus",
    content: ["Location: Bus"],
    next_id: "day3_3_b09"
},
day3_3_b09: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["(Stupid bus!….hurry, hurryyy…)"],
    next_id: "day3_3_b10"
},
day3_3_b10: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["(I can't believe this is happening to me on this day…..right on my <h>birthday</h>….",
              "I'm gifted with such bad luck!)"],
    next_id: "day3_3_b11"
},
day3_3_b11: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["#SENDS MESSAGE TO GROUPCHAT#"],
    next_id: "day3_3_b12"
},
day3_3_b12: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg: "phone",
    content: ["[Girls, I'm really sorry, my bus isn't gonna make it.",
              "Just go on without me…I'll meet you guys on the ground]"],
    next_id: "day3_3_b13"
},
day3_3_b13: {
    speaker: "", portrait: null, bg: "balloon_festival",
    content: ["Location: Ashton Court — Bristol Balloon Fiesta", "{IRIS FINALLY ARRIVES}"],
    next_id: "day3_3_b14"
},
day3_3_b14: {
    speaker: "WIOLA", portrait: "wiola_happy",
    content: ["Hey Iris! Over hereee!"],
    next_id: "day3_3_b15"
},
day3_3_b15: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["huhh!!!"],
    next_id: "day3_3_b16"
},
day3_3_b16: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["You made it!"],
    next_id: "day3_3_b17"
},
day3_3_b17: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["What are you all doing here?! All the balloons <h>took off</h> already!!"],
    next_id: "day3_3_b18"
},
day3_3_b18: {
    speaker: "LAYLA", portrait: "layla_normal",
    content: ["Yehhh….but sadly, ours got punctured…"],
    next_id: "day3_3_b19"
},
day3_3_b19: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Omg Layla always making jokes….Of course we waited for you Iris,",
              "we couldn't have got on it without you…"],
    next_id: "day3_3_b20"
},
day3_3_b20: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["………….guys I'm truly sorry…I can't believe you really-"],
    next_id: "day3_3_b21"
},
day3_3_b21: {
    speaker: "RAYMOND", portrait: "raymond_concerned", bg: "library",
    bgm: "library",
    effect: "shake",
    flash: true,
    content: ["IRIS!!!"],
    next_id: "day3_3_b22"
},
day3_3_b22: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["HUh….Ohh…….I'm…I'm alright.."],
    next_id: "day3_3_b23"
},
day3_3_b23: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["Iris you were out for a good 5 minutes, I almost called the ambulance,",
              "luckily you woke up last second.."],
    next_id: "day3_3_b24"
},
day3_3_b24: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["Sorry Ray I didn't mean to scare you,",
              "I think I'm just exhausted…a lot is going on recently…"],
    next_id: "day3_npc_gift_01"
},

// — Common ending ────────────────────────────────────────────────────────────
day3_npc_gift_01: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["Please are you sure, do you want to go back home?"],
    next_id: "day3_npc_gift_02"
},
day3_npc_gift_02: {
    speaker: "IRIS", portrait: "iris_tired",
    content: ["No, no, really its fine, I'm here already. I'll just have a sip of water"],
    next_id: "day3_npc_gift_03"
},
day3_npc_gift_03: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["So stubborn!"],
    next_id: "day3_npc_gift_04"
},
day3_npc_gift_04: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["Im not letting you out of my sight, you better stick close to me"],
    next_id: "day3_npc_gift_05"
},
day3_npc_gift_05: {
    speaker: "RAYMOND", portrait: "raymond_concerned",
    content: ["I am ready to catch you.."],
    next_id: "day3_npc_gift_06"
},
day3_npc_gift_06: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["hahaha, funny"],
    next_id: "day3_npc_gift_07"
},
day3_npc_gift_07: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["You should be grateful you have such a strong and reliable friend"],
    next_id: "day3_npc_gift_08"
},
day3_npc_gift_08: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["hehe, I very much am, thanks for looking out for me"],
    next_id: "day3_npc_gift_09"
},
day3_npc_gift_09: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["I've got you. Okay before I forget…since I'm away next week,",
              "I have something I want to give you."],
    next_id: "day3_npc_gift_10"
},
day3_npc_gift_10: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["Your <h>birthday</h> is coming up and I bought you a small gift during my travels…"],
    next_id: "day3_npc_gift_11"
},
day3_npc_gift_11: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["OMG you shouldn't have…", "What is it?"],
    next_id: "day3_npc_gift_12"
},
day3_npc_gift_12: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["It's…<h>headphones</h>!"],
    next_id: "day3_npc_gift_13"
},
day3_npc_gift_13: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Omg thats too much! I can't accept them!", "Joking, I can. Show me!"],
    next_id: "day3_npc_gift_14"
},
day3_npc_gift_14: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    event: "showcase", item_id: "Headphones",
    content: ["Here"],
    next_id: "day3_npc_gift_15"
},
day3_npc_gift_15: {
    speaker: "IRIS", portrait: "iris_happy",
    content: ["Really though…… this is such a nice gift. Thank you"],
    next_id: "day3_npc_gift_16"
},
day3_npc_gift_16: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    content: ["No worries, lets go before you faint again…"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 4 NPC — LYDIA: Hallucination & recovery
// Pre-branch   : 01→02→03→04→05→06→07 [CHOICE]
// Path A (Accept): 4_4_a01…a15 → 4_4_blk_a01…blk_a08 → npc_wake_01…wake_17
// Path B (Reject): 4_4_b01…b09 → 4_4_blk_b01…blk_b12 → npc_wake_01…wake_17
// ═══════════════════════════════════════════════════════════════════════════

day4_npc_01: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["IRIS! Hey, what are you doing <h>sat on the ground</h>?"],
    next_id: "day4_npc_02"
},
day4_npc_02: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["Huh?"],
    next_id: "day4_npc_03"
},
day4_npc_03: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["I said..why are you sat on the ground?",
              "Its all wet from the rain!"],
    next_id: "day4_npc_04"
},
day4_npc_04: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["…..I can't move….."],
    next_id: "day4_npc_05"
},
day4_npc_05: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["I…I just feel like I have <h>no control</h> over my body.",
              "Everything feels heavy….."],
    next_id: "day4_npc_06"
},
day4_npc_06: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["Please, just try to get up, you're gonna get sick"],
    next_id: "day4_npc_07"
},
day4_npc_07: {
    speaker: "", portrait: null, bg: "library",
    content: ["Lydia offers you a hand,",
              "but the familiar daunting feeling returns once again…"],
    options: [
        { label: "Accept help from Lydia", next_id: "day4_4_a01" },
        { label: "Reject Lydia's help",    next_id: "day4_4_b01" }
    ]
},

// ── Option A: Accept help ─────────────────────────────────────────────────

day4_4_a01: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    loop_sfx: "heartbeat_short",
    content: ["Here, grab my hand, you can't stay on the floor"],
    next_id: "day4_4_a02"
},
day4_4_a02: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["Ugh…thanks.."],
    next_id: "day4_4_a03"
},
day4_4_a03: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["What's going on you look sick"],
    next_id: "day4_4_a04"
},
day4_4_a04: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["I-my breathing-I..can't breathe…."],
    next_id: "day4_4_a05"
},
day4_4_a05: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    effect: "dizzy",
    content: ["Why- is everything spinning?"],
    next_id: "day4_4_a06"
},
day4_4_a06: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["Iris? What the hell is going on?"],
    next_id: "day4_4_a07"
},
// Operating theatre flash ×3 (auto-advance, instant cut, shake)
day4_4_a07: {
    speaker: "", portrait: null, bg: "operating_theatre",
    no_fade: true, duration: 22, effect: "shake",
    content: [""],
    next_id: "day4_4_a08"
},
day4_4_a08: {
    speaker: "", portrait: null, bg: "library",
    no_fade: true, duration: 10,
    content: [""],
    next_id: "day4_4_a09"
},
day4_4_a09: {
    speaker: "", portrait: null, bg: "operating_theatre",
    no_fade: true, duration: 22, effect: "shake",
    content: [""],
    next_id: "day4_4_a10"
},
day4_4_a10: {
    speaker: "", portrait: null, bg: "library",
    no_fade: true, duration: 10,
    content: [""],
    next_id: "day4_4_a11"
},
day4_4_a11: {
    speaker: "", portrait: null, bg: "operating_theatre",
    no_fade: true, duration: 22, effect: "shake",
    content: [""],
    next_id: "day4_4_a12"
},
day4_4_a12: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    no_fade: true,
    content: ["Waaaaaa!!!!! Aaaaa!!! Get away from me!!!",
              "Go!!! Someone <h>Help</h>!!!"],
    next_id: "day4_4_a13"
},
day4_4_a13: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["IRIS! Stop! What's going on with you?",
              "Everyone is looking at us"],
    next_id: "day4_4_a14"
},
day4_4_a14: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["What? Why are you-? What is this place?"],
    next_id: "day4_4_a15"
},
day4_4_a15: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    sfx: "heartbeat_climax",
    stop_sfx: "heartbeat_short",
    content: ["Get me outtttt!!!"],
    next_id: "day4_4_blk_a01"
},

// ── Option A: VOICE sequence (operating theatre) ──────────────────────────

day4_4_blk_a01: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    no_fade: true,
    content: ["There is no time! We need to do something <h>Doctor</h>!"],
    next_id: "day4_4_blk_a02"
},
day4_4_blk_a02: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    content: ["She is bleeding internally!"],
    next_id: "day4_4_blk_a03"
},
day4_4_blk_a03: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    content: ["Quick!! Prep the <h>operating theatre</h>!"],
    next_id: "day4_4_blk_a04"
},
day4_4_blk_a04: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    content: ["Everyone, out the way!"],
    next_id: "day4_4_blk_a05"
},
day4_4_blk_a05: {
    speaker: "", portrait: null, bg: "operating_theatre",
    loop_sfx: "heartbeat_short",
    content: ["……………………………………",
              "……………………………………"],
    next_id: "day4_4_blk_a06"
},
day4_4_blk_a06: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    content: ["We've got her back…….Great job everyone"],
    next_id: "day4_4_blk_a07"
},
day4_4_blk_a07: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    content: ["That was a close call"],
    next_id: "day4_4_blk_a08"
},
day4_4_blk_a08: {
    speaker: "VOICE", portrait: null, bg: "operating_theatre",
    content: ["Now, I need someone to monitor her hourly and report back to me…"],
    next_id: "day4_npc_wake_01"
},

// ── Option B: Reject help ─────────────────────────────────────────────────

day4_4_b01: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    loop_sfx: "heartbeat_short",
    content: ["Here, grab my hand, you can't stay on the floor"],
    next_id: "day4_4_b02"
},
day4_4_b02: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["NO! Leave me alone, I'm telling you…I-… I can't stand up"],
    next_id: "day4_4_b03"
},
day4_4_b03: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["………..I'm…sorry…I just wanted to-"],
    next_id: "day4_4_b04"
},
day4_4_b04: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["What's that?!…..Turn it off. Turn off that beeping?"],
    next_id: "day4_4_b05"
},
day4_4_b05: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["What are you talking about…you're starting to scare me…."],
    next_id: "day4_4_b06"
},
day4_4_b06: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["…….so it is just me….."],
    next_id: "day4_4_b07"
},
day4_4_b07: {
    speaker: "IRIS", portrait: "iris_distressed", bg: "library",
    content: ["It's so loud in my ears…Make it STOP! I can't I-"],
    next_id: "day4_4_b08"
},
// Brief black flash (heartbeat climax + auto-advance)
day4_4_b08: {
    speaker: "", portrait: null, bg: "black",
    no_fade: true, duration: 20,
    sfx: "heartbeat_climax",
    stop_sfx: "heartbeat_short",
    content: [""],
    next_id: "day4_4_b09"
},
day4_4_b09: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    no_fade: true,
    content: ["……IRIS!?……."],
    next_id: "day4_4_blk_b01"
},

// ── Option B: VOICE sequence (black bg) ──────────────────────────────────

day4_4_blk_b01: {
    speaker: "VOICE", portrait: null, bg: "black",
    no_fade: true,
    content: ["There is no time! We need to do something <h>Doctor</h>!"],
    next_id: "day4_4_blk_b02"
},
day4_4_blk_b02: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["She is bleeding internally!"],
    next_id: "day4_4_blk_b03"
},
day4_4_blk_b03: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["Quick!! Prep the <h>operating theatre</h>!"],
    next_id: "day4_4_blk_b04"
},
day4_4_blk_b04: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["Everyone, out the way!"],
    next_id: "day4_4_blk_b05"
},
day4_4_blk_b05: {
    speaker: "", portrait: null, bg: "black",
    effect: "shake",
    content: ["…………………………………………………………."],
    next_id: "day4_4_blk_b06"
},
day4_4_blk_b06: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["<h>Nothing</h>…shock her again"],
    next_id: "day4_4_blk_b07"
},
day4_4_blk_b07: {
    speaker: "", portrait: null, bg: "black",
    effect: "shake",
    content: ["……………………………………"],
    next_id: "day4_4_blk_b08"
},
day4_4_blk_b08: {
    speaker: "", portrait: null, bg: "black",
    content: ["……………………………………"],
    next_id: "day4_4_blk_b09"
},
day4_4_blk_b09: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["Again!"],
    next_id: "day4_4_blk_b10"
},
day4_4_blk_b10: {
    speaker: "", portrait: null, bg: "black",
    loop_sfx: "heartbeat_short",
    content: ["……………………………………",
              "……………………………………"],
    next_id: "day4_4_blk_b11"
},
day4_4_blk_b11: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["She's back………but if this happens again she will <h>not make it</h>…."],
    next_id: "day4_4_blk_b12"
},
day4_4_blk_b12: {
    speaker: "VOICE", portrait: null, bg: "black",
    content: ["Monitor her every hour, and report back to me"],
    next_id: "day4_npc_wake_01"
},

// ── Common ending: Iris wakes up ──────────────────────────────────────────

day4_npc_wake_01: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    stop_sfx: "heartbeat_short",
    effect: "shake", flash: true,
    content: ["Iris! Iris!…thank god you're awake. Can you hear me?"],
    next_id: "day4_npc_wake_02"
},
day4_npc_wake_02: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["MMmmmhmm"],
    next_id: "day4_npc_wake_03"
},
day4_npc_wake_03: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["You truly scared me, you started <h>seizing</h> and..and..",
              "I just didn't know what to do."],
    next_id: "day4_npc_wake_04"
},
day4_npc_wake_04: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["I was about to call the ambulance but I-…I-…just froze and-"],
    next_id: "day4_npc_wake_05"
},
day4_npc_wake_05: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["Calm down Lydia, I'm fine now…",
              "It's for the best that you didn't…I don't want to cause a big scene"],
    next_id: "day4_npc_wake_06"
},
day4_npc_wake_06: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["But-..But-…something's clearly not right"],
    next_id: "day4_npc_wake_07"
},
day4_npc_wake_07: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["I know what it looks like but trust me, I've got it all under control…",
              "I've just been very <h>overworked</h> recently…"],
    next_id: "day4_npc_wake_08"
},
day4_npc_wake_08: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["I will see a proper <h>Doctor</h> on the weekend, no need to worry anymore"],
    next_id: "day4_npc_wake_09"
},
day4_npc_wake_09: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["Okay….I trust that you know what you're doing.",
              "Just promise to keep me updated on everything. I don't want to worry"],
    next_id: "day4_npc_wake_10"
},
day4_npc_wake_10: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["I promise…let's just go to class.",
              "I <h>can't afford</h> to <h>fail</h> my exams"],
    next_id: "day4_npc_wake_11"
},
day4_npc_wake_11: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["Iris you know that is more important than your health and look…",
              "And your shoes are soaking <h>wet</h>! How can you go to class like that?"],
    next_id: "day4_npc_wake_12"
},
day4_npc_wake_12: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["Ummm…I can just quickly dry them off,",
              "with the dryer, in the toilet…"],
    next_id: "day4_npc_wake_13"
},
day4_npc_wake_13: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["We're going to be late.",
              "Here just borrow my <h>wellies</h>. I have spare trainers in my bag, will a size 5 fit?"],
    next_id: "day4_npc_wake_14"
},
day4_npc_wake_14: {
    speaker: "", portrait: null, bg: "library",
    event: "showcase", item_id: "Rain Boots",
    content: [""],
    next_id: "day4_npc_wake_15"
},
day4_npc_wake_15: {
    speaker: "IRIS", portrait: "iris_tired", bg: "library",
    content: ["Umm, yes that's also my size. Thank you, I'll return them to you after"],
    next_id: "day4_npc_wake_16"
},
day4_npc_wake_16: {
    speaker: "LYDIA", portrait: "lydia", bg: "library",
    content: ["No need, they're yours to keep.",
              "It rains all the time nowadays and I have a second pair at home"],
    next_id: "day4_npc_wake_17"
},
day4_npc_wake_17: {
    speaker: "IRIS", portrait: "iris_normal", bg: "library",
    content: ["Alright, thank you, this really helps. Let's head off now"],
},

// ═══════════════════════════════════════════════════════════════════════════
// DAY 5 NPC — CHARLOTTE + endings (node-based)
//
// Opening (01–03): VOICE in hot_air_balloon bg, heartbeat_short loop
// Choice 1 (04): "Continue listening to voices" → day5_5_a01
//                "Snap out of it"                → day5_5_b01
// Convergence (conv01–25): shared Charlotte + IRIS + VOICE section
// Choice 2 (conv25): "Give in to voices" → day5_5_c01
//                    "Listen to Charlotte" → day5_5_d01
// SZPITAL (szpital01–12): converges both branches
// Final choice (szpital12): "Say YES" → day5_yes_01 (bad ending)
//                            "Say NO"  → day5_no_01  (good ending)
// Bad ending:  day5_yes_01–blk–end–bad_news_01–05 → onComplete → CREDITS
// Good ending: day5_no_01–06–blk–wake–wake_01–18–good_news_01–05 → onComplete → CREDITS
// ═══════════════════════════════════════════════════════════════════════════

// DAY 5 NPC — CHARLOTTE: Final decision
day5_npc_01: {
    speaker: "VOICE",
    loop_sfx: "heartbeat_short",
    content: ["How is she?"],
    next_id: "day5_npc_02"
},
day5_npc_02: {
    speaker: "VOICE",
    effect: "shake",
    content: ["She is stable for now, but we don't know how it will all progress"],
    next_id: "day5_npc_03"
},
day5_npc_03: {
    speaker: "VOICE",
    content: ["Her brain is still recovering, she's taken a lot of damage"],
    next_id: "day5_npc_04"
},
day5_npc_04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["The voices are back. I still don't know who they are talking about…"],
    options: [
        { label: "Continue listening to voices", next_id: "day5_5_a01" },
        { label: "Snap out of it",                next_id: "day5_5_b01" }
    ]
},

// ── Branch A: Continue listening to voices ──────────────────────────────────
day5_5_a01: {
    speaker: "VOICE",
    effect: "shake", bg_blur: 6,
    content: ["She's truly lucky to have <h>survived</h>"],
    next_id: "day5_5_a02"
},
day5_5_a02: {
    speaker: "VOICE",
    content: ["By the looks of it she has a lot of people who care about her"],
    next_id: "day5_5_a04"
},
day5_5_a04: {
    speaker: "VOICE",
    stop_sfx: "heartbeat_short",
    content: ["She deserves to rest now, please keep an eye on her"],
    next_id: "day5_5_a05"
},
day5_5_a05: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Uughhh…every time I hear these voices…",
              "the pain feels like my head is about to <h>explode</h>.."],
    next_id: "day5_5_a06"
},
day5_5_a06: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Perhaps, I shouldn't push my body too much.."],
    next_id: "day5_5_a07"
},
day5_5_a07: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Wooow….is that-?……"],
    next_id: "day5_npc_conv01"
},

// ── Branch B: Snap out of it ────────────────────────────────────────────────
day5_5_b01: {
    speaker: "IRIS", portrait: "iris_distressed",
    stop_sfx: "heartbeat_short", bg_blur: 6,
    content: ["None of this is making any sense…when will this stop?!"],
    next_id: "day5_5_b02"
},
day5_5_b02: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["I can't keep pushing to get through…my body can't handle this for much longer"],
    next_id: "day5_5_b03"
},
day5_5_b03: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Any kind of physical activity I do, just appears to be <h>detrimental</h> to my health…",
              "I need…rest….."],
    next_id: "day5_5_b04"
},
day5_5_b04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Wooow….is that-?……"],
    next_id: "day5_npc_conv01"
},

// ── Convergence after initial branches ──────────────────────────────────────
day5_npc_conv01: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg_blur: 0, no_fade: true,
    content: ["Iris! Here you areee!"],
    next_id: "day5_npc_conv02"
},
day5_npc_conv02: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Why are you just standing there?"],
    next_id: "day5_npc_conv03"
},
day5_npc_conv03: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["………………………."],
    next_id: "day5_npc_conv04"
},
day5_npc_conv04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["…….It's <h>hot air balloons</h>!"],
    next_id: "day5_npc_conv05"
},
day5_npc_conv05: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["So many of them….."],
    next_id: "day5_npc_conv06"
},
day5_npc_conv06: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Why are they all taking off in this weather? Isn't it <h>dangerous</h>?"],
    next_id: "day5_npc_conv07"
},
day5_npc_conv07: {
    speaker: "VOICE",
    effect: "shake",
    content: ["Now we need to establish a long term treatment plan…",
              "her friends are not yet aware that her body is not set for full recovery"],
    next_id: "day5_npc_conv08"
},
day5_npc_conv08: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["……………"],
    next_id: "day5_npc_conv09"
},
day5_npc_conv09: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["How <h>peculiar</h>…. do you also feel this?",
              "Suddenly the earth feel so still and quiet. Everything moves like it is no longer bound to time…"],
    next_id: "day5_npc_conv10"
},
day5_npc_conv10: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Iris what are you saying…?"],
    next_id: "day5_npc_conv11"
},
day5_npc_conv11: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Don't you feel like it's beautiful? The sky today is especially dark",
              "yet the balloons…they illuminate the sky with their beautiful colours…"],
    next_id: "day5_npc_conv12"
},
day5_npc_conv12: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Only together can they create such a beautiful image.",
              "After this whole week…of….<h>pain</h>….only now I do feel…peaceful and whole"],
    next_id: "day5_npc_conv13"
},
day5_npc_conv13: {
    speaker: "VOICE",
    effect: "shake",
    content: ["They're all here waiting for you, you just need to rise.."],
    next_id: "day5_npc_conv14"
},
day5_npc_conv14: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Iris, you're acting weird…just snap out of it!"],
    next_id: "day5_npc_conv15"
},
day5_npc_conv15: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Just look at them……it's truly magical"],
    next_id: "day5_npc_conv16"
},
day5_npc_conv16: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["I want to <h>stay</h> in this melancholy <h>forever</h>,",
              "please let me stay a little longer"],
    next_id: "day5_npc_conv17"
},
day5_npc_conv17: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["I dydhe iknwieeb ewhuuid is heewrjdng wi euo"],
    next_id: "day5_npc_conv18"
},
day5_npc_conv18: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Hmm? ….Did you say something..?"],
    next_id: "day5_npc_conv19"
},
day5_npc_conv19: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["I said..weli swhe'll meik it trhogh"],
    next_id: "day5_npc_conv20"
},
day5_npc_conv20: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["..?…"],
    next_id: "day5_npc_conv21"
},
day5_npc_conv21: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["I said I wanted to ask you something…have you forgetten?"],
    next_id: "day5_npc_conv22"
},
day5_npc_conv22: {
    speaker: "IRIS", portrait: "iris_normal",
    content: ["No NO, of course not, I specifically came in today just to see you"],
    next_id: "day5_npc_conv23"
},
day5_npc_conv23: {
    speaker: "IRIS", portrait: "iris_normal",
    content: ["What is it?"],
    next_id: "day5_npc_conv24"
},
day5_npc_conv24: {
    speaker: "VOICE",
    loop_sfx: "heartbeat_short", bg_blur: 8,
    content: ["It was a brain bleed…luckily the-"],
    next_id: "day5_npc_conv25"
},
day5_npc_conv25: {
    speaker: "IRIS", portrait: "iris_distressed",
    stop_sfx: "heartbeat_short",
    content: ["Aghhh the voices again…I CAN'T MAKE THEM STOP!!!"],
    options: [
        { label: "Give in and listen to the voices", next_id: "day5_5_c01" },
        { label: "Listen to Charlotte",               next_id: "day5_5_d01" }
    ]
},

// ── Branch C: Give in to voices ──────────────────────────────────────────────
day5_5_c01: {
    speaker: "VOICE",
    stop_sfx: "heartbeat_short",
    content: ["It was a brain bleed…luckily the operation <h>went well</h>"],
    next_id: "day5_5_c02"
},
day5_5_c02: {
    speaker: "VOICE",
    content: ["But we currently have no expectations on how she will progress"],
    next_id: "day5_5_c03"
},
day5_5_c03: {
    speaker: "VOICE",
    content: ["Now it is <h>UP TO HER</h>"],
    next_id: "day5_5_c04"
},
day5_5_c04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Wait……did something happen to me recently….."],
    next_id: "day5_5_c05"
},
day5_5_c05: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Something bad? I can't put my finger on it…"],
    next_id: "day5_5_c06"
},
day5_5_c06: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Tell me what it was!"],
    next_id: "day5_5_c07"
},
day5_5_c07: {
    speaker: "VOICE",
    stop_sfx: "heartbeat_short", bg_blur: 0,
    content: ["For now, I've said everything I know…..just remember to rest…."],
    next_id: "day5_5_c08"
},
day5_5_c08: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["You know what, never mind Iris….. I spoke to Ray and Lydia…….",
              "they told me that you were acting so <h>strange</h> recently."],
    next_id: "day5_5_c09"
},
day5_5_c09: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["But I thought I should see you myself before making any judgement.",
              "Clearly you're <h>not sane</h>!"],
    next_id: "day5_5_c10"
},
day5_5_c10: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Just forget about it"],
    next_id: "day5_5_c11"
},
day5_5_c11: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["No, No please Charlotte I'm sorry, I don't know what's happening to me!"],
    next_id: "day5_5_c12"
},
day5_5_c12: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["please just tell me……"],
    next_id: "day5_5_c13"
},
day5_5_c13: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["……….Alright……….…."],
    next_id: "day5_szpital_01"
},

// ── Branch D: Listen to Charlotte ────────────────────────────────────────────
day5_5_d01: {
    speaker: "IRIS", portrait: "iris_distressed",
    stop_sfx: "heartbeat_short", bg_blur: 0,
    content: ["Sorry Charlotte, I'm trying to listen to you",
              "but all I hear is <h>chaos</h>, someone is in my head!"],
    next_id: "day5_5_d02"
},
day5_5_d02: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["……?.…."],
    next_id: "day5_5_d03"
},
day5_5_d03: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["I wanted to tell you about all of this, but I didn't have the opportunity.",
              "I thought all of it would pass"],
    next_id: "day5_5_d04"
},
day5_5_d04: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["but I feel like soon enough it will kill me…"],
    next_id: "day5_5_d05"
},
day5_5_d05: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Please tell me what you had to say to me,",
              "you are more <h>important</h> than anything else…"],
    next_id: "day5_5_d06"
},
day5_5_d06: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Im just sick of it all, and I know what impact it's had on everyone"],
    next_id: "day5_5_d07"
},
day5_5_d07: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["ist fjone..i kwns tsfgi is nei rjsjly yoi"],
    next_id: "day5_5_d08"
},
day5_5_d08: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["………?……."],
    next_id: "day5_5_d09"
},
day5_5_d09: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["*SOBBING*…...I don't understand….."],
    next_id: "day5_5_d10"
},
day5_5_d10: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Don't cry please…I said it's alright I'll tell you"],
    next_id: "day5_szpital_01"
},

// ── SZPITAL convergence ──────────────────────────────────────────────────────
day5_szpital_01: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Me, Wiola, Layla, Ray and Lydia thought to all go out this weekend.",
              "There is a new club opening on Queens road, '<h>SZPITAL</h>'."],
    next_id: "day5_szpital_02"
},
day5_szpital_02: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["We all have so many things that are causing us <h>pressure</h> at the moment;",
              "upcoming <h>exams</h>…..<h>relationships</h>….<h>study</h>….<h>finances</h>… all of it."],
    next_id: "day5_szpital_03"
},
day5_szpital_03: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["And we all wanted to let ourselves go, just this once and all go out."],
    next_id: "day5_szpital_04"
},
day5_szpital_04: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["I believe it will do you especially good"],
    next_id: "day5_szpital_05"
},
day5_szpital_05: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["But…you guys <h>don't</h> even <h>like</h> clubbing.",
              "And how can you offer me such thing….just look at the state of me"],
    next_id: "day5_szpital_06"
},
day5_szpital_06: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["So what? Just because we don't like it, doesn't mean we will never do it again"],
    next_id: "day5_szpital_07"
},
day5_szpital_07: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["But why? Times are <h>tough</h> right now, but the <h>reality</h> remains the same…"],
    next_id: "day5_szpital_08"
},
day5_szpital_08: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["dancing it off in a crowd of smelly drunken teens, won't make things feel any lighter"],
    next_id: "day5_szpital_09"
},
day5_szpital_09: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Besides………..this air…the rain….feels like it's cleansing me….",
              "all my worries and sorrows….just <h>disappear</h>…."],
    next_id: "day5_szpital_10"
},
day5_szpital_10: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["if I could just get closer to the balloons……"],
    next_id: "day5_szpital_11"
},
day5_szpital_11: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Nonsense… It's already decided and we're all going"],
    next_id: "day5_szpital_12"
},
day5_szpital_12: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    content: ["Are you coming or not?"],
    next_id: "day5_szpital_final"
},
day5_szpital_final: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["Why is she pushing me? I'm starting to question if any of this is even real…"],
    options: [
        { label: "Say YES",                      next_id: "day5_yes_01" },
        { label: "Say NO and see what awaits…",  next_id: "day5_no_01"  }
    ]
},

// ═══════════════════════════════════════════════════════════════════════════
// BAD ENDING — Say YES (death)
// ═══════════════════════════════════════════════════════════════════════════

day5_yes_01: {
    speaker: "IRIS", portrait: "iris_distressed",
    loop_sfx: "heartbeat_short", bg_blur: 3,
    content: ["Best know I am only doing this for you guys.",
              "I miss having you in my life…..and and-"],
    next_id: "day5_yes_02"
},
day5_yes_02: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg_blur: 5,
    content: ["Hold on…I think it's all starting to come back to me now…..",
              "my memory….I…..I remember it all now…."],
    next_id: "day5_yes_03"
},
day5_yes_03: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg_blur: 6,
    content: ["The accident….."],
    next_id: "day5_yes_04"
},
day5_yes_04: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg_blur: 7,
    content: ["This is all from my past… all of these feelings now make sense…",
              "I must've transformed into my old self…."],
    next_id: "day5_yes_05"
},
day5_yes_05: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg_blur: 8,
    content: ["None of this could've been real…I have a job and a life in London now….",
              "but If this is not real then…."],
    next_id: "day5_yes_06"
},
day5_yes_06: {
    speaker: "IRIS", portrait: "iris_distressed",
    content: ["<h>Where am I now</h>?………"],
    next_id: "day5_yes_blk"
},
day5_yes_blk: {
    bg: "black",
    stop_sfx: "heartbeat_short", loop_sfx: "heartbeat_climax",
    bg_blur: 0, no_fade: true,
    no_speaker_box: true, instant_text: true,
    content: [""],
    duration: 210,
    next_id: "day5_yes_end"
},
day5_yes_end: {
    bg: "black",
    stop_all_audio: true, music: "death",
    no_speaker_box: true, instant_text: true,
    content: [""],
    duration: 150,
    next_id: "day5_bad_news_01"
},
day5_bad_news_01: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["BREAKING NEWS"],
    next_id: "day5_bad_news_02"
},
day5_bad_news_02: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["A 28-year-old woman injured in Monday's <h>collision</h>,",
              "has unfortunately <h>died</h> earlier today at St Thomas' Hospital"],
    next_id: "day5_bad_news_03"
},
day5_bad_news_03: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["Staff confirm she passed away earlier this morning."],
    next_id: "day5_bad_news_03b"
},
day5_bad_news_03b: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["Though there was <h>no information</h> in regards to family,",
              "her <h>close-knit circle of friends</h> had remained at her bedside throughout"],
    next_id: "day5_bad_news_04"
},
day5_bad_news_04: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["The police have now concluded the incident was a deliberate act,"],
    next_id: "day5_bad_news_04b"
},
day5_bad_news_04b: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["linked to 'unmanageable' professional <h>pressures</h>",
              "and a decline in her <h>mental wellbeing</h>."],
    next_id: "day5_bad_news_05"
},
day5_bad_news_05: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["Her friends describe her as a woman who simply",
              "<h>ran out of strength</h> in a city that never stops"],
    action: 'go_credits',
},

// ═══════════════════════════════════════════════════════════════════════════
// GOOD ENDING — Say NO (survival + floating narration)
// ═══════════════════════════════════════════════════════════════════════════

day5_no_01: {
    bg: "bg_float_street",
    music: "life_inst",
    no_speaker_box: true, instant_text: true,
    content: ["Iris is now fully enthralled by the sky."],
    duration: 200,
    next_id: "day5_no_02"
},
day5_no_02: {
    bg: "bg_float_street",
    no_speaker_box: true, instant_text: true,
    content: ["She bends her knees and gently pushes off the floor."],
    duration: 200,
    next_id: "day5_no_03"
},
day5_no_03: {
    bg: "bg_float_street",
    no_speaker_box: true, instant_text: true,
    content: ["She levitates and closes her eyes in response to the beaming rays of light piercing through the dark clouds."],
    duration: 270,
    next_id: "day5_no_04"
},
day5_no_04: {
    bg: "bg_float_street",
    no_speaker_box: true, instant_text: true,
    content: ["The rain washes away the last trace of greyness and restores the rich colour to the buildings along <h>Park Street</h>."],
    duration: 270,
    next_id: "day5_no_05"
},
day5_no_05: {
    bg: "bg_float_iris",
    no_speaker_box: true, instant_text: true,
    content: ["She lets the sun warm her face as she drifts closer and closer to the hot air balloon parade."],
    duration: 240,
    next_id: "day5_no_06"
},
day5_no_06: {
    bg: "bg_float_iris",
    no_speaker_box: true, instant_text: true,
    content: ["What a feeling! She wishes she could stay there forever, but the sun suddenly summons a blinding light, causing her to squint…"],
    duration: 300,
    next_id: "day5_no_blk"
},
day5_no_blk: {
    bg: "black",
    no_speaker_box: true, instant_text: true,
    content: [""],
    duration: 30,
    next_id: "day5_no_wake"
},
day5_no_wake: {
    bg: "hospital",
    bg_blur: 10, no_fade: true,
    effect: "eye_blink",
    no_speaker_box: true, instant_text: true,
    content: [""],
    duration: 210,
    next_id: "day5_wake_01"
},

// ── Hospital awakening ───────────────────────────────────────────────────────
day5_wake_01: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg: "hospital", no_fade: true,
    content: ["….Iris?…."],
    next_id: "day5_wake_02"
},
day5_wake_02: {
    speaker: "LAYLA", portrait: "layla_happy",
    bg: "hospital",
    content: ["Omg Iris!"],
    next_id: "day5_wake_03"
},
day5_wake_03: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    bg: "hospital",
    content: ["She's awake!"],
    next_id: "day5_wake_04"
},
day5_wake_04: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg: "hospital",
    content: ["Let me grab the doctor!"],
    next_id: "day5_wake_05"
},
day5_wake_05: {
    speaker: "WIOLA", portrait: "wiola_normal",
    bg: "hospital",
    content: ["No!….Wait a second.", "Give her a moment to wake up"],
    next_id: "day5_wake_06"
},
day5_wake_06: {
    speaker: "LYDIA", portrait: "lydia",
    bg: "hospital",
    content: ["I can't believe this is really happening!"],
    next_id: "day5_wake_07"
},
day5_wake_07: {
    speaker: "IRIS", portrait: "iris_tired",
    bg: "hospital",
    content: ["….Whh..at?"],
    next_id: "day5_wake_08"
},
day5_wake_08: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg: "hospital",
    content: ["Shhhhhhh…let her wake up"],
    next_id: "day5_wake_09"
},
day5_wake_09: {
    bg: "hospital",
    no_speaker_box: true,
    content: ["…………."],
    next_id: "day5_wake_10"
},
day5_wake_10: {
    speaker: "IRIS", portrait: "iris_tired",
    bg: "hospital",
    content: ["…….Where?….Where am I?………"],
    next_id: "day5_wake_11"
},
day5_wake_11: {
    speaker: "RAYMOND", portrait: "raymond_normal",
    bg: "hospital",
    content: ["You're in the hospital,", "but don't worry everything it's alright"],
    next_id: "day5_wake_12"
},
day5_wake_12: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg: "hospital",
    content: ["But…a second ago I was…I saw…..you all…what?"],
    next_id: "day5_wake_13"
},
day5_wake_13: {
    speaker: "LAYLA", portrait: "layla_normal",
    bg: "hospital",
    content: ["We think you were dreaming, although you were in a <h>coma</h>,",
              "your eyes were moving around under your eyelids. Seems like it was going on forever…."],
    next_id: "day5_wake_14"
},
day5_wake_14: {
    speaker: "LYDIA", portrait: "lydia",
    bg: "hospital",
    content: ["Yeah.. that scared me a little"],
    next_id: "day5_wake_15"
},
day5_wake_15: {
    speaker: "IRIS", portrait: "iris_tired",
    bg: "hospital",
    content: ["So…all this time…it was all just a <h>bad dream</h>?…"],
    next_id: "day5_wake_16"
},
day5_wake_16: {
    speaker: "WIOLA", portrait: "wiola_normal",
    bg: "hospital",
    content: ["Girl! You tried to kill yourself! What were you thinking, running under that car!",
              "Half of the UK heard about this, I swear if you scare me like this again, you better run!"],
    next_id: "day5_wake_17"
},
day5_wake_17: {
    speaker: "LAYLA", portrait: "layla_normal",
    bg: "hospital",
    content: ["WIOLA STOP OMG! Save it for later"],
    next_id: "day5_wake_18"
},
day5_wake_18: {
    speaker: "WIOLA", portrait: "wiola_normal",
    bg: "hospital",
    content: ["…"],
    next_id: "day5_wake_19"
},
day5_wake_19: {
    speaker: "RAYMOND", portrait: "raymond_normal",
    bg: "hospital",
    content: ["We were all so worried about you,",
              "when we heard about this we all rushed in to see you"],
    next_id: "day5_wake_20"
},
day5_wake_20: {
    speaker: "IRIS", portrait: "iris_tired",
    bg: "hospital",
    content: ["But…but you guys all live so far..I've only caused trouble.."],
    next_id: "day5_wake_21"
},
day5_wake_21: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg: "hospital",
    content: ["Don't say that Iris..It is not your fault,",
              "we know how busy and <h>over worked</h> you've been."],
    next_id: "day5_wake_22"
},
day5_wake_22: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg: "hospital",
    content: ["If only we messaged more frequently…this is the least we could do"],
    next_id: "day5_wake_23"
},
day5_wake_23: {
    speaker: "LYDIA", portrait: "lydia",
    bg: "hospital",
    content: ["Well, it was the least we could do..but we did more…"],
    next_id: "day5_wake_24"
},
day5_wake_24: {
    speaker: "LYDIA", portrait: "lydia",
    bg: "hospital",
    content: ["in fact, we came up with an idea that we can all <h>start a company</h> together"],
    next_id: "day5_wake_25"
},
day5_wake_25: {
    speaker: "IRIS", portrait: "iris_distressed",
    bg: "hospital",
    content: ["What? That is a crazy idea, how will that ever work?"],
    next_id: "day5_wake_26"
},
day5_wake_26: {
    speaker: "LAYLA", portrait: "layla_happy",
    bg: "hospital",
    content: ["Don't worry about it. While you were having your baby nap,",
              "the five of us talked over all the details. It is truly not as hard as you think"],
    next_id: "day5_wake_27"
},
day5_wake_27: {
    speaker: "RAYMOND", portrait: "raymond_normal",
    bg: "hospital",
    content: ["We all have things we don't like about our current jobs….",
              "and we realised that there is nothing truly keeping us there…"],
    next_id: "day5_wake_28"
},
day5_wake_28: {
    speaker: "IRIS", portrait: "iris_happy",
    bg: "hospital",
    content: ["I…am truly taken away…if only this could work.",
              "I've also been thinking…and our years at Uni have actually been the happiest years of my life."],
    next_id: "day5_wake_29"
},
day5_wake_29: {
    speaker: "IRIS", portrait: "iris_happy",
    bg: "hospital",
    content: ["I don't want to sweet talk….but you guys truly are like family….",
              "I've missed you all ever since"],
    next_id: "day5_wake_30"
},
day5_wake_30: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    bg: "hospital",
    content: ["So sweet, my teeth hurt…"],
    next_id: "day5_wake_31"
},
day5_wake_31: {
    speaker: "IRIS", portrait: "iris_happy",
    bg: "hospital",
    content: ["Shush Ray…I know you love it really..."],
    next_id: "day5_wake_32"
},
day5_wake_32: {
    speaker: "IRIS", portrait: "iris_happy",
    bg: "hospital",
    content: ["Only thing I won't miss is climbing Park Street…",
              "everyday I poured my blood, sweat and tears to reach the top…"],
    next_id: "day5_wake_33"
},
day5_wake_33: {
    speaker: "RAYMOND", portrait: "raymond_happy",
    bg: "hospital",
    content: ["hehe"],
    next_id: "day5_wake_34"
},
day5_wake_34: {
    speaker: "LAYLA", portrait: "layla_happy",
    bg: "hospital",
    content: ["hahahaha"],
    next_id: "day5_wake_35"
},
day5_wake_35: {
    speaker: "CHARLOTTE", portrait: "charlotte_normal",
    bg: "hospital",
    content: ["Hahaha, Iris you are truly the one and only, <h>Park Street Survivor</h>!"],
    next_id: "day5_good_news_01"
},

// ── Good ending news ─────────────────────────────────────────────────────────
day5_good_news_01: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["BREAKING NEWS"],
    next_id: "day5_good_news_02"
},
day5_good_news_02: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["After days in a deep coma with no signs or neurological response,",
              "she <h>regained consciousness</h> earlier this morning"],
    next_id: "day5_good_news_03"
},
day5_good_news_03: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["While there is no information about her family,",
              "the close-knit group of friends kept a 24-hour vigil at her bedside",
              "and say they <h>never gave up</h> hope"],
    next_id: "day5_good_news_04"
},
day5_good_news_04: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["Investigators have now concluded the incident was a deliberate act,"],
    next_id: "day5_good_news_04b"
},
day5_good_news_04b: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["one directly linked to unmanageable professional pressures",
              "and a severe decline in the young woman's mental wellbeing."],
    next_id: "day5_good_news_05"
},
day5_good_news_05: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["Yet, what began as a profound tragedy has, against all odds,",
              "offered her the chance at a <h>new beginning</h>."],
    next_id: "day5_good_news_05b"
},
day5_good_news_05b: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["Ladies and gentlemen, it is a truly stirring story;",
              "a reminder that even in the face of <h>insurmountable pressure</h>,"],
    next_id: "day5_good_news_05c"
},
day5_good_news_05c: {
    speaker: "NEWSREADER", bg: "news_hospital",
    content: ["there is hope to be found in the people who refuse to let us go.",
              "From all of us here, goodnight."],
    action: 'go_credits',
},

};

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD-COMPAT — Legacy array format for Cutscene.js
// These properties mirror the original array-based structure so the existing
// engine (Cutscene.js) continues to work unchanged while the new node-based
// format above is used for future engine development.
// ─────────────────────────────────────────────────────────────────────────────

DIALOGUE_DATA.prologue = [
    { speaker: 'NEWSREADER', text: 'BREAKING NEWS' },
    { speaker: 'NEWSREADER', text: 'An unexpected <h>car crash</h> has just taken place, causing a major blockage near Blackfriars Underpass. We have been informed by the Metropolitan Police that <h>a woman</h>, believed to be in her late 20s, was struck by a car shortly after 18:00 this evening' },
    { speaker: 'NEWSREADER', text: "Emergency services have rushed her to the hospital in critical condition. According to current updates, the circumstances of the accident remain <h>unclear</h>, and several witnesses claim the woman may have acted <h>intentionally</h>." },
    { speaker: 'NEWSREADER', text: 'Exact circumstances are yet to be established…' },
];

DIALOGUE_DATA.day_room = {
    1: [
        { speaker: 'IRIS', text: "8:00 o'clock already?!" },
        { speaker: 'IRIS', text: "That was the <h>best sleep</h> I've had for a long time" },
        { speaker: 'IRIS', text: "My neck does feel a little stiff though…why is that?" },
        { speaker: 'IRIS', text: "Never mind, the weather is truly <h>sunny</h> today, can't let such a day go to waste!" },
        { speaker: 'IRIS', text: "Just need to grab some things before I'm off" },
    ],
    2: [
        { speaker: 'IRIS', text: "Hmm time to get up again.." },
        { speaker: 'IRIS', text: "Wow, and the weather is <h>still bright</h>!" },
        { speaker: 'IRIS', text: "Perhaps I can even make a quick stop at GAIL'S and buy myself an iced matcha!" },
        { speaker: 'IRIS', text: "There is only one problem…." },
        { speaker: 'IRIS', text: "My body still feels so <h>sore</h>, could it really be after climbing that hill?" },
        { speaker: 'IRIS', text: "Never mind, the first day is always the worst.." },
        { speaker: 'IRIS', text: "Surely my body will get used to it." },
        { speaker: 'IRIS', text: "Better grab my things and go!" },
    ],
    3: [
        { speaker: 'IRIS', text: "Why do I feel like the alarm sounds even more vague? I barely heard it this morning..." },
        { speaker: 'IRIS', text: "Maybe my tiredness, is really coming through..." },
        { speaker: 'IRIS', text: "Damn… and here we go back to the standard gloomy weather. I only hope it doesn't rain..." },
        { speaker: 'IRIS', text: "Each day seems to be worse than the other, I don't smoke or drink… or even go clubbing, why is my body this weak?" },
        { speaker: 'IRIS', text: "So annoying." },
        { speaker: 'IRIS', text: "Maybe I really should contact my <h>GP</h> someday." },
        { speaker: 'IRIS', text: "Anyway, let's grab some things and go!" },
    ],
    4: [
        { speaker: 'IRIS', text: "What is that sound? It's not my phone..." },
        { speaker: 'IRIS', text: "It sounds like a heart monitor? So strange. It must just be in my head." },
        { speaker: 'IRIS', text: "And the room... It feels so cold." },
        { speaker: 'IRIS', text: "I really wish I don't have to go to Uni. My legs are trembling and I can barely stand." },
        { speaker: 'IRIS', text: "Great! And it's pouring outside... As if life couldn't get any worse." },
        { speaker: 'IRIS', text: "I guess the only good thing right now are my friends, no matter how bad the days seem, they always lift up my spirits..." },
        { speaker: 'IRIS', text: "I truly hope we can stay in touch in the future." },
        { speaker: 'IRIS', text: "Whatever…It's almost the weekend... I can pull through. Let's get going..." },
    ],
    5: [
        { speaker: 'IRIS', text: "UUUUUGGGHHHH......" },
        { speaker: 'IRIS', text: "I couldn't breathe again. That dream…it was so god damn real... What does it all mean!?" },
        { speaker: 'IRIS', text: "I can't take it anymore! With all these things getting worse... I'm scared to think where does this all end?" },
        { speaker: 'IRIS', text: "Does it even end!? Maybe now this is my life, a perpetual loop of suffering." },
        { speaker: 'IRIS', text: "NO... I can't think like this... Just breathe Iris... breathe..." },
        { speaker: 'IRIS', text: "Apart from this sinister malaise... I actually feel fulfilled with my life." },
        { speaker: 'IRIS', text: "Having my friends, studying for my dream career, and being passionate about my goals..." },
        { speaker: 'IRIS', text: "Inevitably it all makes me happy." },
        { speaker: 'IRIS', text: "I will always cherish these years at Uni." },
        { speaker: 'IRIS', text: "Unfortunately it rains again, but I promised Charlotte that I will meet her today..." },
        { speaker: 'IRIS', text: "I guess I have no choice but to get going... One last time." },
    ],
};

DIALOGUE_DATA.day_npc = {
    1: [
        { speaker: 'WIOLA', text: "Heyy Iris! Long time no see!" },
        { speaker: 'IRIS',  text: "......", options: [
            { label: "Wiola... Hi, it's nice to see you!", nextIndex: 2 },
            { label: "Hey girl, it's been ages",             nextIndex: 2 },
        ]},
        { speaker: 'WIOLA', text: "What have you been up to lately?" },
        { speaker: 'IRIS',  text: "....Oh..not...much.." },
        { speaker: 'WIOLA', text: "I see, have you prepared for today's software engineering lecture?" },
        { speaker: 'IRIS',  text: "Noo... Actually, I can't really remember last night. I must've just passed out in my sleep." },
        { speaker: 'WIOLA', text: "Haha, no worries." },
        { speaker: 'WIOLA', text: "Luckily, I've overviewed the contents last night, I think it's about Object-Oriented Design." },
        { speaker: 'WIOLA', text: "Just sit with me and I'll talk you through it." },
        { speaker: 'IRIS',  text: "She's always so helpful...", options: [
            { label: "Thanks, you've always got my back!", nextIndex: 10 },
            { label: "You're a life saver!",               nextIndex: 10 },
        ]},
        { speaker: 'IRIS',  text: "I'm truly looking forward to it, especially as I can sit down for a while after climbing this dreaded hill." },
        { speaker: 'IRIS',  text: "My legs are killing me!" },
        { speaker: 'WIOLA', text: "Hahaha, well at least your daily cardio is out the way. Such a relief that I live close by." },
        { speaker: 'IRIS',  text: "JEALOUS!" },
        { speaker: 'WIOLA', text: "hehe... I actually have something that could help. Recently I bought some vitamin gummies. Here, they are quite delicious, and they will give you some energy.", onShow: { type: 'item_received', name: 'VITAMIN GUMMIES' } },
        { speaker: 'IRIS',  text: "Wow thank you, orange flavour, MY FAVOURITE!" },
        { speaker: 'WIOLA', text: "No worries, come on now sleepyhead. We're gonna be late!" },
    ],
    2: [
        { speaker: 'LAYLA', text: "IRIS! You alright? You look like you just ran a marathon!" },
        { speaker: 'IRIS',  text: "...H..Hi!" },
        { speaker: 'IRIS',  text: "....I....I....I'm still not used to climbing this stupid hill.." },
        { speaker: 'IRIS',  text: "Every day the hill feels like a torture." },
        { speaker: 'LAYLA', text: "HAH! Park Street is not for the weak!" },
        { speaker: 'LAYLA', text: "It's alright, you're here now. We still have 10 minutes left before class." },
        { speaker: 'LAYLA', text: "How come you don't take the bus?" },
        { speaker: 'IRIS',  text: "Ohh....well..I don't really have the money for it. Money is a bit tight these days." },
        { speaker: 'IRIS',  text: "Besides, I guess it's good for my health. So it's not all that bad." },
        { speaker: 'LAYLA', text: "I get it, you want to burn off all the Ji's Chicken you eat!" },
        { speaker: 'IRIS',  text: "Shhhh! Don't mention it!" },
        { speaker: 'LAYLA', text: "Haha, I'm just playing." },
        { speaker: 'IRIS',  text: "About the chicken...", options: [
            { label: "I eat fried chicken with no regrets!", nextIndex: 14 },
            { label: "Fried chicken is my life!",            nextIndex: 14 },
        ]},
        { speaker: 'LAYLA', text: "HAHAHA!" },
        { speaker: 'IRIS',  text: "Anyway... weirdly enough, today I did not see any homeless people on my way. Usually, I always pass them next to TESCO." },
        { speaker: 'LAYLA', text: "Hah, maybe they're sleeping it off after last night's shenanigans." },
        { speaker: 'IRIS',  text: "hahaha, maybe." },
        { speaker: 'LAYLA', text: "Who knows? They run on their own cycle. Anyway, I have a cool gift for you!" },
        { speaker: 'LAYLA', text: "It is a tangle toy! I remember you telling me about your ADHD... it will work well for your focus.", onShow: { type: 'item_received', name: 'TANGLE TOY' } },
        { speaker: 'IRIS',  text: "WOW thanks! It looks super cute! And it's purple! My fave!" },
        { speaker: 'LAYLA', text: "No probs, let's go. You can try it out in class." },
    ],
    3: [
        { speaker: 'IRIS',    text: "HI RAY, so glad to see you!" },
        { speaker: 'RAYMOND', text: "Hey Hey!" },
        { speaker: 'IRIS',    text: "How are you getting on with your courses and study?" },
        { speaker: 'RAYMOND', text: "Oh it's alright, recently I've been travelling a little, so I have some catching up to do." },
        { speaker: 'RAYMOND', text: "But nothing I can't handle.." },
        { speaker: 'IRIS',    text: "Travel...", options: [
            { label: "I admire how you balance travel and study!", nextIndex: 6 },
            { label: "Next time let's go together!",               nextIndex: 6 },
        ]},
        { speaker: 'IRIS',    text: "I also hope to travel this summer... as long as......" },
        { speaker: 'IRIS',    text: "..........." },
        { speaker: 'RAYMOND', text: "HEY!! IRIS!! Are you alright?!!" },
        { speaker: 'IRIS',    text: "........." },
        { speaker: 'RAYMOND', text: "IRIS OMG, WAKE UP!" },
        { speaker: 'IRIS',    text: "Ohh.... I'm... I'm alright.. I just felt a bit dizzy." },
        { speaker: 'RAYMOND', text: "WHAT!? ARE YOU SURE? You looked like you were about to pass out." },
        { speaker: 'IRIS',    text: "No, no, I think I'm just exhausted... this stupid hill always gets me..." },
        { speaker: 'IRIS',    text: "One day, I'll end up on my deathbed because of it… But not today." },
        { speaker: 'RAYMOND', text: "Are you sure you don't want to go back?" },
        { speaker: 'IRIS',    text: "No, no, really it's fine. I'll just have a sip of water." },
        { speaker: 'RAYMOND', text: "So stubborn! I'm not letting you out of my sight, stick close to me." },
        { speaker: 'IRIS',    text: "Ha, ha, ha, funny." },
        { speaker: 'RAYMOND', text: "Okay silly, I have something for you. A small gift during my travels… headphones!", onShow: { type: 'item_received', name: 'HEADPHONES' } },
        { speaker: 'IRIS',    text: "Omg that's too much! Joking, I can accept them. Show me!" },
        { speaker: 'RAYMOND', text: "Here. Let's go before you faint again…" },
    ],
    4: [
        { speaker: 'LYDIA', text: "IRIS! Hey, what are you doing sat on the ground? It's totally wet!" },
        { speaker: 'IRIS', text: "Huh?" },
        { speaker: 'IRIS', text: ".....I can't move….. I feel like I have no control over my body." },
        { speaker: 'LYDIA', text: "Just try to get up, you're gonna get sick." },
        { speaker: 'IRIS', text: "Help...", options: [
            { label: "UGhhh... yeah.. give me a sec...", nextIndex: 9 },
            { label: "STOP! DON'T TOUCH ME!",            nextIndex: 7 },
        ]},
        { speaker: 'LYDIA', text: "What's wrong with you Iris?! Im just trying to help." },
        { speaker: 'IRIS', text: "YEAH, well I don't need your help!", nextIndex: 9 },
        { speaker: 'LYDIA', text: "Alright, tell me what's going on. Your skin is so pale. Shouldn't you see a doctor?" },
        { speaker: 'IRIS', text: "..........Wait.....my..... breath........I....can't-" },
        { speaker: '???',  text: "There is no time! We need to do something! She is bleeding internally! Quick!! Prep the operating theatre!" },
        { speaker: 'LYDIA', text: "...IRIS!?... IRIS!!! WHAT THE HELL HAPPENED!?" },
        { speaker: 'IRIS', text: ".....hmm? I don't know... everything just turned black." },
        { speaker: 'LYDIA', text: "Iris are you alright!? You passed out! You almost died!" },
        { speaker: 'IRIS', text: "The truth...", options: [
            { label: "I've been having these episodes recently...", nextIndex: 16 },
            { label: "Go away! You won't understand!",              nextIndex: 14 },
        ]},
        { speaker: 'LYDIA', text: "Well, I'm sorry... I'm just trying to be a good friend." },
        { speaker: 'IRIS', text: "You're right. I know. This really isn't me.", nextIndex: 16 },
        { speaker: 'LYDIA', text: "Let's go to the GP on the weekend. You even forgot your wellies today! You must be overwhelmed." },
        { speaker: 'IRIS', text: "Wellies? .....Oh yes... I forgot about them." },
        { speaker: 'IRIS', text: "Anyway, I still want to go to the lecture. I can't afford to fail." },
        { speaker: 'LYDIA', text: "Alright, follow me then, stay close." },
    ],
    5: [
        { speaker: '???',       text: "Welcome back Iris……you did well" },
        { speaker: '???',       text: "Your condition is now stable" },
        { speaker: '???',       text: "I have a small surprise for you" },
        { speaker: 'IRIS',      text: "The voices...", options: [
            { label: "Continue listening to the unknown voices", nextIndex: 4 },
            { label: "Snap out of it",                           nextIndex: 7 },
        ]},
        { speaker: '???',       text: "Looks like you have some guests..." },
        { speaker: '???',       text: "Iris! I can't believe I'm seeing you like this.. STOP, she barely made it through, let her rest", nextIndex: 7 },
        { speaker: 'IRIS',      text: "Ugh...I'm still having hallucinations....but somehow my body feels...better?" },
        { speaker: 'IRIS',      text: "I cannot make any sense of this, looks like it's not a linear thing" },
        { speaker: 'IRIS',      text: "My mind is still convoluted, but my limbs feel....light... Like I'm levitating" },
        { speaker: 'CHARLOTTE', text: "Iris! Here you areee! Why are you just standing there?" },
        { speaker: 'IRIS',      text: ".....It's hot air balloons! So many of them....." },
        { speaker: '???',       text: "It's alright, the dangerous part is now behind us..now we must wait" },
        { speaker: 'IRIS',      text: "How peculiar... Suddenly the earth feels so still and quiet. Everything moves as though no longer bound to time..." },
        { speaker: 'CHARLOTTE', text: "Iris what are you saying...?" },
        { speaker: 'IRIS',      text: "Don't you feel like it's beautiful? Like a painting... I want to join them..." },
        { speaker: '???',       text: "They're all here waiting for you, you just need to rise.." },
        { speaker: 'CHARLOTTE', text: "Iris, you're acting weird…just snap out of it! I dydhe iknwieeb ewhuuid is heewrjdng wi euo.." },
        { speaker: 'IRIS',      text: "What did you say?" },
        { speaker: 'CHARLOTTE', text: "I said..weli swhe'll meik it trhogh" },
        { speaker: 'CHARLOTTE', text: "I said I wanted to ask you something..or did you forget?" },
        { speaker: 'IRIS',      text: "No No, of course not. What is it" },
        { speaker: 'IRIS',      text: "Who to listen to?", options: [
            { label: "Keep listening to the unknown voices", nextIndex: 22 },
            { label: "Listen to Charlotte",                  nextIndex: 30 },
        ]},
        { speaker: '???',       text: "It was a brain bleed…luckily the operation went well" },
        { speaker: '???',       text: "But we currently have no expectations on how she will progress. It is up to her." },
        { speaker: 'IRIS',      text: "Wait......did something happen to me recently..... Something bad?" },
        { speaker: '???',       text: "For now, I've said everything I know.....just remember to rest...." },
        { speaker: 'CHARLOTTE', text: "You know what, never mind Iris... Clearly your not sane!" },
        { speaker: 'CHARLOTTE', text: "Just forget about it." },
        { speaker: 'IRIS',      text: "No, No please Charlotte I'm sorry, I don't know what's happening to me!" },
        { speaker: 'IRIS',      text: "Please just tell me......", nextIndex: 30 },
        { speaker: 'CHARLOTTE', text: "Alright....finee.... We thought to go out this weekend to a new club called 'SZPITAL'." },
        { speaker: 'IRIS',      text: "(..SZPITAL? That is not an English word, I wonder what it means...)" },
        { speaker: 'IRIS',      text: "But...you guys don't even like clubbing." },
        { speaker: 'CHARLOTTE', text: "So what? Just because we don't like it, doesn't mean we will never do it again" },
        { speaker: 'IRIS',      text: "Besides........this air...the rain....feels like it's cleansing me....if I could only go higher....." },
        { speaker: 'CHARLOTTE', text: "Nonsense... It's already decided and we're all going" },
        { speaker: 'CHARLOTTE', text: "Are you coming or not?", options: [
            { label: "No. I can't keep running away from my problems.", action: 'good_ending' },
            { label: "Okay. But I don't know if I have the strength.",  action: 'bad_ending'  },
        ]},
    ],
};

DIALOGUE_DATA.awakening_reality = [
    { speaker: 'CHARLOTTE', text: "...Iris?..." },
    { speaker: 'LAYLA',     text: "Omg Iris!" },
    { speaker: 'RAYMOND',   text: "She's awake!" },
    { speaker: 'CHARLOTTE', text: "Let me grab the doctor!" },
    { speaker: 'WIOLA',     text: "No!... Wait a second. Give her a moment to wake up." },
    { speaker: 'LYDIA',      text: "I can't believe this is really happening!" },
    { speaker: 'IRIS',      text: "...Whh...at?" },
    { speaker: 'CHARLOTTE', text: "Shhhhhhh... let her wake up." },
    { speaker: 'CHARLOTTE', text: "......" },
    { speaker: 'WIOLA',     text: "......" },
    { speaker: 'LAYLA',     text: "......" },
    { speaker: 'RAYMOND',   text: "......" },
    { speaker: 'LYDIA',      text: "......" },
    { speaker: 'IRIS',      text: "...Where?... Where am I?..." },
    { speaker: 'RAYMOND',   text: "You're in the hospital, but don't worry, everything is alright." },
    { speaker: 'IRIS',      text: "But... a second ago I was... I saw... you all... what?" },
    { speaker: 'LAYLA',     text: "We think you were dreaming. Although you were in a coma, your eyes were moving around under your eyelids." },
    { speaker: 'LAYLA',     text: "Seems like it was going on forever..." },
    { speaker: 'LYDIA',      text: "Yeah... that scared me a little." },
    { speaker: 'IRIS',      text: "So... all this time... it was all just a bad dream?..." },
    { speaker: 'WIOLA',     text: "Girl! You tried to kill yourself! What were you thinking, running under that car? Half of the UK heard about this!" },
    { speaker: 'WIOLA',     text: "I swear, if you scare me like this again, you better run!" },
    { speaker: 'LAYLA',     text: "WIOLA STOP, OMG! Save it for later!" },
    { speaker: 'WIOLA',     text: "..." },
    { speaker: 'RAYMOND',   text: "We were all so worried about you. When we heard about this, we all rushed in to see you." },
    { speaker: 'IRIS',      text: "But... but you guys all live so far... I've only caused trouble..." },
    { speaker: 'CHARLOTTE', text: "Don't say that, Iris. It is not your fault. We know how busy and overworked you've been." },
    { speaker: 'CHARLOTTE', text: "If only we messaged more frequently... This is the least we could do." },
    { speaker: 'LYDIA',      text: "Well, it was the least we could do... but we did more." },
    { speaker: 'LYDIA',      text: "In fact, we came up with an idea that we can all start a company together!" },
    { speaker: 'IRIS',      text: "What? That is a crazy idea! How will that ever work?" },
    { speaker: 'LAYLA',     text: "Don't worry about it. While you were having your baby nap, the five of us talked over all the details." },
    { speaker: 'LAYLA',     text: "It is truly not as hard as you think." },
    { speaker: 'RAYMOND',   text: "We all have things we don't like about our current jobs... and we realized that there is nothing truly keeping us there..." },
    { speaker: 'IRIS',      text: "I... am truly taken away... if only this could work. I've also been thinking... and our years at Uni have actually been the happiest years of my life." },
    { speaker: 'IRIS',      text: "I don't want to sweet talk... but you guys truly are like family... I've missed you all ever since." },
    { speaker: 'RAYMOND',   text: "So sweet, my teeth hurt..." },
    { speaker: 'IRIS',      text: "Shush Ray... I know you love it really..." },
    { speaker: 'IRIS',      text: "Only thing I won't miss is climbing Park Street... every day I poured my blood, sweat and tears to reach the top..." },
    { speaker: 'RAYMOND',   text: "Hehe." },
    { speaker: 'LAYLA',     text: "Hahahaha!" },
    { speaker: 'CHARLOTTE', text: "Hahaha, Iris, you are truly the one and only, Park Street Survivor!" },
];

DIALOGUE_DATA.day_npc_start = {
    1: 'day1_npc_01',
    2: 'day2_npc_01',
    3: 'day3_npc_01',
    4: 'day4_npc_01',
    5: 'day5_npc_01',
};

// Node-based room cutscene entry points (used by sketch.js room launch instead of CS_DAY_ROOM)
DIALOGUE_DATA.day_room_start = {
    4: 'day4_room_01',
    5: 'day5_room_01',
};

DIALOGUE_DATA.endings = {
    bad: [
        "A 28-year-old woman, named Iris,",
        "has been put into a medically induced coma,",
        "after recently sustaining a traumatic brain injury from a car crash.",
        "All her friends surround her by her bed,",
        "in hopes she will open her eyes.",
        "",
        "Suddenly, a piercing flat line sound comes from the heart monitor.",
        "Chaos fills the room as doctors fight to save her life,",
        "sadly…… minutes after……",
        "she passes away.",
    ],
    good: [
        "Iris is now fully enthralled by the sky.",
        "She bends her knees and gently pushes off the floor.",
        "She levitates and closes her eyes,",
        "as beaming rays of light pierce through the dark clouds.",
        "The rain washes away the last trace of greyness,",
        "restoring the rich colour to the buildings along Park Street.",
        "She lets the sun warm her face...",
        "drifting closer and closer to the hot air balloon parade.",
        "",
        "What a feeling! She wishes she could stay there forever,",
        "but the sun suddenly summons a blinding light,",
        "causing her to squint…",
    ],
};
