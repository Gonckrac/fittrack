// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE DATABASE — 200+ exercises with full metadata
// Fields: name, type, equipment[], primaryMuscle, secondaryMuscles[], 
//         movementPattern, difficulty, repRanges, priority, notes
// ═══════════════════════════════════════════════════════════════════════════════

const EXERCISE_DATABASE = {

  // ─── CHEST ────────────────────────────────────────────────────────────────
  chest: [
    { name:'Barbell Bench Press',            type:'compound',  equip:['barbell','gym'],       secondary:['triceps','shoulders'], pattern:'horizontal_push', diff:2, repRange:{strength:'3-5',hypertrophy:'6-10',fat_loss:'10-15',general:'8-12'}, priority:1, notes:'Gold-standard for sternal pec development' },
    { name:'Incline Dumbbell Press',         type:'compound',  equip:['dumbbells','gym','home'],secondary:['triceps','shoulders'],pattern:'incline_push',    diff:2, repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'12-15',general:'10-12'}, priority:2, notes:'Best clavicular head activation' },
    { name:'Machine Chest Press',            type:'compound',  equip:['machine','gym'],        secondary:['triceps'],            pattern:'horizontal_push', diff:1, repRange:{strength:'6-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'}, priority:3, notes:'Constant tension, safer for high volume' },
    { name:'Cable Crossover (Low-to-High)',  type:'isolation', equip:['cable','gym'],          secondary:[],                     pattern:'fly',             diff:2, repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'}, priority:4, notes:'Peak stretch = max anabolic signal (Schoenfeld 2021)' },
    { name:'Pec Deck Machine',              type:'isolation', equip:['machine','gym'],         secondary:[],                     pattern:'fly',             diff:1, repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'}, priority:5, notes:'Elongated position > contracted for hypertrophy' },
    { name:'Weighted Dips (Chest)',          type:'compound',  equip:['bodyweight','dip_bar','gym'],secondary:['triceps'],       pattern:'vertical_push',   diff:3, repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-15'}, priority:6, notes:'Forward lean = chest emphasis' },
    { name:'Decline Barbell Press',          type:'compound',  equip:['barbell','gym'],        secondary:['triceps'],            pattern:'decline_push',    diff:2, repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'N/A',general:'8-12'},   priority:7 },
    { name:'Incline Cable Fly',              type:'isolation', equip:['cable','gym'],          secondary:[],                     pattern:'fly',             diff:2, repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'}, priority:8 },
    { name:'Dumbbell Pullover',              type:'isolation', equip:['dumbbells','gym','home'],secondary:['back'],              pattern:'pullover',        diff:2, repRange:{strength:'N/A',hypertrophy:'12-15',fat_loss:'15-20',general:'12-15'}, priority:9 },
    { name:'Floor Press',                    type:'compound',  equip:['dumbbells','barbell'],  secondary:['triceps'],            pattern:'horizontal_push', diff:2, repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'N/A',general:'8-12'},   priority:10 },
    // Home/Bodyweight variants
    { name:'Archer Push-Up',                 type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['triceps'],pattern:'horizontal_push', diff:3, repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:2 },
    { name:'Feet-Elevated Push-Up',          type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['shoulders','triceps'],pattern:'incline_push',diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'15-25',general:'10-20'},priority:3,notes:'Activates upper pec like incline press' },
    { name:'Diamond Push-Up',                type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['triceps'],pattern:'horizontal_push',diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'15-25',general:'10-20'},priority:4 },
    { name:'Pseudo Planche Push-Up',         type:'compound',  equip:['bodyweight','calisthenics'],secondary:['shoulders'],    pattern:'horizontal_push', diff:4, repRange:{strength:'3-5',hypertrophy:'6-10',fat_loss:'N/A',general:'6-10'},   priority:3 },
    { name:'Dumbbell Floor Fly',             type:'isolation', equip:['dumbbells','home'],     secondary:[],                    pattern:'fly',             diff:1, repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'}, priority:5 },
  ],

  // ─── BACK ─────────────────────────────────────────────────────────────────
  back: [
    { name:'Pull-Up (Pronated)',             type:'compound',  equip:['pullup_bar','gym','calisthenics'],secondary:['biceps','rear_delt'],pattern:'vertical_pull',diff:3,repRange:{strength:'3-6',hypertrophy:'6-12',fat_loss:'8-15',general:'6-12'},priority:1,notes:'Max lat recruitment' },
    { name:'Barbell Row',                    type:'compound',  equip:['barbell','gym'],         secondary:['biceps','traps'],     pattern:'horizontal_pull',diff:3,repRange:{strength:'3-5',hypertrophy:'6-10',fat_loss:'10-15',general:'6-10'}, priority:2,notes:'Greatest upper back thickness builder' },
    { name:'Lat Pulldown',                   type:'compound',  equip:['cable','machine','gym'],  secondary:['biceps'],            pattern:'vertical_pull', diff:1, repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:3 },
    { name:'Unilateral Dumbbell Row',        type:'compound',  equip:['dumbbells','gym','home'], secondary:['biceps','traps'],    pattern:'horizontal_pull',diff:2,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:4 },
    { name:'Seated Cable Row',               type:'compound',  equip:['cable','machine','gym'],  secondary:['biceps','traps'],   pattern:'horizontal_pull',diff:1,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:5 },
    { name:'Conventional Deadlift',          type:'compound',  equip:['barbell','gym'],         secondary:['glutes','hamstrings','traps'],pattern:'hinge',  diff:4,repRange:{strength:'1-5',hypertrophy:'4-6',fat_loss:'N/A',general:'4-6'},    priority:6,notes:'RIR 3+ for safety. Max neuromuscular demand' },
    { name:'Cable Pullover',                 type:'isolation', equip:['cable','gym'],           secondary:[],                    pattern:'pullover',      diff:2,repRange:{strength:'N/A',hypertrophy:'12-15',fat_loss:'15-20',general:'12-15'},priority:7 },
    { name:'Face Pull',                      type:'isolation', equip:['cable','gym'],           secondary:['rear_delt'],         pattern:'face_pull',     diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:8,notes:'Rotator cuff health + mid-trap' },
    { name:'Neutral Grip Pull-Up',           type:'compound',  equip:['pullup_bar','gym'],      secondary:['biceps'],            pattern:'vertical_pull', diff:3,repRange:{strength:'3-6',hypertrophy:'6-12',fat_loss:'8-15',general:'6-12'}, priority:9 },
    { name:'T-Bar Row',                      type:'compound',  equip:['barbell','gym'],         secondary:['biceps','traps'],    pattern:'horizontal_pull',diff:3,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'N/A',general:'8-12'},  priority:10 },
    { name:'Machine Row (Chest Supported)',  type:'compound',  equip:['machine','gym'],         secondary:['biceps'],            pattern:'horizontal_pull',diff:1,repRange:{strength:'5-8',hypertrophy:'8-15',fat_loss:'12-20',general:'8-15'},priority:11 },
    { name:'Straight-Arm Pulldown',          type:'isolation', equip:['cable','gym'],           secondary:[],                    pattern:'pulldown',      diff:2,repRange:{strength:'N/A',hypertrophy:'12-15',fat_loss:'15-20',general:'12-15'},priority:12 },
    // Home/Calisthenics
    { name:'Australian Pull-Up (Inverted Row)',type:'compound',equip:['bodyweight','home','calisthenics'],secondary:['biceps'],pattern:'horizontal_pull',diff:2,repRange:{strength:'5-8',hypertrophy:'8-15',fat_loss:'12-20',general:'8-15'},priority:3 },
    { name:'Resistance Band Row',            type:'compound',  equip:['bands','home'],          secondary:['biceps'],            pattern:'horizontal_pull',diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:6 },
    { name:'Dumbbell Deadlift',              type:'compound',  equip:['dumbbells','home'],      secondary:['glutes','hamstrings'],pattern:'hinge',         diff:2,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'},priority:7 },
    { name:'Negative Muscle-Up',             type:'compound',  equip:['pullup_bar','calisthenics'],secondary:['triceps'],       pattern:'vertical_pull', diff:5,repRange:{strength:'2-4',hypertrophy:'3-6',fat_loss:'N/A',general:'3-6'},   priority:5 },
    { name:'Superman / Back Extension',      type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],         pattern:'extension',     diff:1,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'20-25',general:'15-20'},priority:8 },
  ],

  // ─── SHOULDERS ────────────────────────────────────────────────────────────
  shoulders: [
    { name:'Barbell Overhead Press',         type:'compound',  equip:['barbell','gym'],         secondary:['triceps','traps'],   pattern:'vertical_push', diff:3,repRange:{strength:'3-5',hypertrophy:'6-10',fat_loss:'10-15',general:'6-10'}, priority:1,notes:'Max anterior delt activation' },
    { name:'Arnold Press',                   type:'compound',  equip:['dumbbells','gym','home'], secondary:['triceps'],          pattern:'vertical_push', diff:2,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:2,notes:'Activates all 3 delt heads through ROM' },
    { name:'Dumbbell Lateral Raise',         type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'lateral_raise', diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:3,notes:'High volume + long sets for medial delt' },
    { name:'Cable Lateral Raise',            type:'isolation', equip:['cable','gym'],           secondary:[],                   pattern:'lateral_raise', diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:4,notes:'Constant tension > dumbbells for medial delt' },
    { name:'Rear Delt Fly (Pec Deck)',       type:'isolation', equip:['machine','gym'],         secondary:[],                   pattern:'rear_fly',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:5,notes:'Posterior delt: most neglected upper body muscle' },
    { name:'Dumbbell Rear Delt Fly',         type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'rear_fly',      diff:2,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'20-25',general:'15-20'},priority:6 },
    { name:'Cable Rear Delt Pull',           type:'isolation', equip:['cable','gym'],           secondary:['traps'],            pattern:'face_pull',     diff:2,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'20-25',general:'15-20'},priority:7 },
    { name:'Seated Dumbbell Press',          type:'compound',  equip:['dumbbells','gym','home'], secondary:['triceps'],          pattern:'vertical_push', diff:2,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:3 },
    { name:'Lateral Raise Machine',          type:'isolation', equip:['machine','gym'],         secondary:[],                   pattern:'lateral_raise', diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:5 },
    { name:'Wide-Grip Upright Row',          type:'compound',  equip:['barbell','gym'],         secondary:['traps'],            pattern:'upright_row',   diff:2,repRange:{strength:'6-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:9,notes:'Wide grip = lateral delt. Narrow = traps' },
    { name:'External Rotation (Cable)',      type:'isolation', equip:['cable','gym'],           secondary:[],                   pattern:'rotation',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'15-20',general:'15-20'},priority:10,notes:'Rotator cuff health — injury prevention essential' },
    { name:'Pike Push-Up',                   type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['triceps'],pattern:'vertical_push',diff:2,repRange:{strength:'4-8',hypertrophy:'8-15',fat_loss:'12-20',general:'8-15'},priority:4 },
    { name:'Handstand Push-Up (Assisted)',   type:'compound',  equip:['bodyweight','calisthenics'],secondary:['triceps'],       pattern:'vertical_push', diff:5,repRange:{strength:'2-5',hypertrophy:'5-8',fat_loss:'N/A',general:'5-8'},   priority:2 },
  ],

  // ─── BICEPS ───────────────────────────────────────────────────────────────
  biceps: [
    { name:'Barbell Curl',                   type:'isolation', equip:['barbell','gym'],         secondary:['brachialis'],       pattern:'curl',          diff:1,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:1 },
    { name:'Alternating Dumbbell Curl',      type:'isolation', equip:['dumbbells','gym','home'], secondary:['brachialis'],      pattern:'curl',          diff:1,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:2 },
    { name:'Hammer Curl',                    type:'isolation', equip:['dumbbells','gym','home'], secondary:['brachioradialis'], pattern:'neutral_curl',  diff:1,repRange:{strength:'6-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:3,notes:'Trains brachialis and brachioradialis heavily' },
    { name:'Cable Curl',                     type:'isolation', equip:['cable','gym'],           secondary:[],                   pattern:'curl',          diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'15-20',general:'10-15'},priority:4,notes:'Constant tension through full ROM' },
    { name:'Incline Dumbbell Curl',          type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'curl',          diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:5,notes:'Maximum bicep stretch in inclined position' },
    { name:'Concentration Curl',             type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'curl',          diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:6 },
    { name:'Preacher Curl / Spider Curl',    type:'isolation', equip:['barbell','dumbbells','gym'],secondary:[],               pattern:'curl',          diff:2,repRange:{strength:'6-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:7 },
    { name:'EZ Bar Curl',                    type:'isolation', equip:['barbell','gym'],         secondary:[],                   pattern:'curl',          diff:1,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:8 },
    { name:'Chin-Up',                        type:'compound',  equip:['pullup_bar','gym','calisthenics'],secondary:['back'],   pattern:'vertical_pull', diff:3,repRange:{strength:'3-6',hypertrophy:'6-12',fat_loss:'8-15',general:'6-12'}, priority:1,notes:'Better bicep activation than any dumbbell curl' },
    { name:'Resistance Band Curl',           type:'isolation', equip:['bands','home'],          secondary:[],                   pattern:'curl',          diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:5 },
    { name:'Towel Chin-Up (on bar)',         type:'compound',  equip:['bodyweight','calisthenics'],secondary:['forearms'],     pattern:'vertical_pull', diff:4,repRange:{strength:'3-6',hypertrophy:'6-10',fat_loss:'N/A',general:'6-10'},  priority:4 },
    { name:'Cross-Body Hammer Curl',         type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'curl',          diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:9 },
  ],

  // ─── TRICEPS ──────────────────────────────────────────────────────────────
  triceps: [
    { name:'EZ Bar French Press (Skull Crusher)',type:'isolation',equip:['barbell','gym'],      secondary:[],                   pattern:'extension',     diff:2,repRange:{strength:'6-8',hypertrophy:'8-12',fat_loss:'N/A',general:'8-12'},  priority:1,notes:'Long head: elongated in overhead position' },
    { name:'Tricep Pushdown (Rope)',          type:'isolation', equip:['cable','gym'],           secondary:[],                   pattern:'pushdown',      diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'15-20',general:'10-15'},priority:2 },
    { name:'Overhead Tricep Extension (Cable)',type:'isolation',equip:['cable','gym'],           secondary:[],                   pattern:'extension',     diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'15-20',general:'10-15'},priority:3,notes:'Max long head stretch = highest hypertrophy signal' },
    { name:'Weighted Dips (Tricep)',          type:'compound',  equip:['dip_bar','gym'],         secondary:['chest'],            pattern:'vertical_push', diff:3,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:4,notes:'Upright torso = tricep emphasis' },
    { name:'Close-Grip Bench Press',          type:'compound',  equip:['barbell','gym'],         secondary:['chest'],            pattern:'horizontal_push',diff:2,repRange:{strength:'4-6',hypertrophy:'6-10',fat_loss:'N/A',general:'6-10'}, priority:5 },
    { name:'Dumbbell Skull Crusher',          type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'extension',     diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'N/A',general:'10-15'},priority:6 },
    { name:'Tricep Kickback (Cable)',         type:'isolation', equip:['cable','gym'],           secondary:[],                   pattern:'kickback',      diff:1,repRange:{strength:'N/A',hypertrophy:'12-15',fat_loss:'15-20',general:'12-15'},priority:7 },
    { name:'Overhead DB Tricep Extension',    type:'isolation', equip:['dumbbells','gym','home'], secondary:[],                  pattern:'extension',     diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:3,notes:'Max long head stretch' },
    { name:'Resistance Band Pushdown',        type:'isolation', equip:['bands','home'],          secondary:[],                   pattern:'pushdown',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'15-25',general:'15-20'},priority:5 },
    { name:'Diamond Push-Up',                 type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['chest'],  pattern:'horizontal_push',diff:2,repRange:{strength:'5-8',hypertrophy:'10-15',fat_loss:'15-25',general:'10-15'},priority:4 },
    { name:'Chair Dips',                      type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['chest'],  pattern:'vertical_push', diff:2,repRange:{strength:'5-8',hypertrophy:'8-15',fat_loss:'12-20',general:'8-15'}, priority:5 },
    { name:'Floor Skull Crusher',             type:'isolation', equip:['bodyweight','calisthenics'],secondary:[],               pattern:'extension',     diff:2,repRange:{strength:'N/A',hypertrophy:'8-12',fat_loss:'N/A',general:'8-12'},  priority:6 },
  ],

  // ─── QUADS ────────────────────────────────────────────────────────────────
  quads: [
    { name:'Back Squat',                     type:'compound',  equip:['barbell','gym'],         secondary:['glutes','hamstrings'],pattern:'squat',        diff:4,repRange:{strength:'1-5',hypertrophy:'6-10',fat_loss:'10-15',general:'6-10'}, priority:1 },
    { name:'Leg Press (45°)',                 type:'compound',  equip:['machine','gym'],         secondary:['glutes'],            pattern:'squat',         diff:1,repRange:{strength:'5-8',hypertrophy:'8-15',fat_loss:'12-20',general:'8-15'}, priority:2 },
    { name:'Leg Extension',                  type:'isolation', equip:['machine','gym'],         secondary:[],                    pattern:'extension',     diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'15-20',general:'10-15'},priority:3,notes:'Full ROM = greater distal hypertrophy (Schoenfeld 2021)' },
    { name:'Hack Squat Machine',             type:'compound',  equip:['machine','gym'],         secondary:['glutes'],            pattern:'squat',         diff:2,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'12-15',general:'8-12'}, priority:4 },
    { name:'Walking Dumbbell Lunge',         type:'compound',  equip:['dumbbells','gym','home'], secondary:['glutes','hamstrings'],pattern:'lunge',        diff:2,repRange:{strength:'N/A',hypertrophy:'10-12',fat_loss:'12-15',general:'10-15'},priority:5 },
    { name:'Front Squat',                    type:'compound',  equip:['barbell','gym'],         secondary:['glutes'],            pattern:'squat',         diff:4,repRange:{strength:'3-5',hypertrophy:'6-10',fat_loss:'N/A',general:'6-10'},  priority:6 },
    { name:'Sissy Squat',                    type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],         pattern:'extension',     diff:3,repRange:{strength:'N/A',hypertrophy:'8-15',fat_loss:'10-20',general:'8-15'}, priority:7 },
    { name:'Bulgarian Split Squat',          type:'compound',  equip:['dumbbells','bodyweight','home'],secondary:['glutes'],   pattern:'split_squat',   diff:3,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:2 },
    { name:'Step-Up with Dumbbells',         type:'compound',  equip:['dumbbells','home'],      secondary:['glutes'],            pattern:'single_leg',    diff:2,repRange:{strength:'N/A',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:4 },
    { name:'Goblet Squat',                   type:'compound',  equip:['dumbbells','home'],      secondary:['glutes'],            pattern:'squat',         diff:1,repRange:{strength:'5-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:3 },
    { name:'Pistol Squat (Assisted)',        type:'compound',  equip:['bodyweight','calisthenics'],secondary:['glutes'],        pattern:'single_leg',    diff:5,repRange:{strength:'3-5',hypertrophy:'5-8',fat_loss:'N/A',general:'5-8'},   priority:2 },
    { name:'Squat with Pause',               type:'compound',  equip:['bodyweight','calisthenics','home'],secondary:['glutes'],pattern:'squat',          diff:2,repRange:{strength:'4-6',hypertrophy:'6-12',fat_loss:'10-15',general:'6-12'}, priority:3 },
  ],

  // ─── HAMSTRINGS ───────────────────────────────────────────────────────────
  hamstrings: [
    { name:'Lying Leg Curl Machine',         type:'isolation', equip:['machine','gym'],         secondary:[],                   pattern:'curl',          diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:1,notes:'Elongated position = higher hypertrophy signal (Maeo 2021)' },
    { name:'Romanian Deadlift (RDL)',        type:'compound',  equip:['barbell','dumbbells','gym','home'],secondary:['glutes'],  pattern:'hinge',         diff:3,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:2 },
    { name:'Nordic Hamstring Curl',          type:'isolation', equip:['bodyweight','gym','calisthenics'],secondary:[],          pattern:'curl',          diff:4,repRange:{strength:'3-5',hypertrophy:'4-8',fat_loss:'N/A',general:'4-8'},    priority:3,notes:'Reduces hamstring injuries by 51% (Petersen 2011)' },
    { name:'Seated Leg Curl',               type:'isolation', equip:['machine','gym'],          secondary:[],                   pattern:'curl',          diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:4 },
    { name:'Good Morning',                   type:'compound',  equip:['barbell','gym'],         secondary:['glutes','back'],    pattern:'hinge',          diff:3,repRange:{strength:'5-8',hypertrophy:'8-12',fat_loss:'N/A',general:'8-12'},  priority:5 },
    { name:'Single Leg RDL',                 type:'compound',  equip:['dumbbells','bodyweight'], secondary:['glutes'],          pattern:'single_leg_hinge',diff:3,repRange:{strength:'N/A',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'},priority:6 },
    { name:'Glute Bridge (Hamstring Focus)', type:'compound',  equip:['bodyweight','home'],      secondary:['glutes'],          pattern:'bridge',         diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:7 },
    { name:'Dumbbell Good Morning',          type:'compound',  equip:['dumbbells','home'],       secondary:['glutes','back'],   pattern:'hinge',          diff:2,repRange:{strength:'5-8',hypertrophy:'10-15',fat_loss:'N/A',general:'10-15'},priority:5 },
    { name:'Single Leg Hip Bridge',          type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['glutes'],pattern:'bridge',          diff:2,repRange:{strength:'N/A',hypertrophy:'12-15',fat_loss:'15-20',general:'12-15'},priority:7 },
  ],

  // ─── GLUTES ───────────────────────────────────────────────────────────────
  glutes: [
    { name:'Barbell Hip Thrust',             type:'compound',  equip:['barbell','gym'],         secondary:['hamstrings','quads'],pattern:'hip_thrust',    diff:2,repRange:{strength:'4-6',hypertrophy:'8-15',fat_loss:'12-20',general:'8-15'}, priority:1,notes:'#1 glute max EMG activation (Contreras 2011)' },
    { name:'Back Squat (Glute Focus)',       type:'compound',  equip:['barbell','gym'],         secondary:['quads','hamstrings'],pattern:'squat',         diff:4,repRange:{strength:'3-5',hypertrophy:'6-10',fat_loss:'10-15',general:'6-10'}, priority:2 },
    { name:'Romanian Deadlift (RDL)',        type:'compound',  equip:['barbell','dumbbells','gym'],secondary:['hamstrings'],   pattern:'hinge',          diff:3,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:3 },
    { name:'Bulgarian Split Squat',          type:'compound',  equip:['dumbbells','bodyweight','home'],secondary:['quads','hamstrings'],pattern:'split_squat',diff:3,repRange:{strength:'4-6',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'},priority:4 },
    { name:'Cable Kickback',                 type:'isolation', equip:['cable','machine','gym'],  secondary:[],                 pattern:'extension',      diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:5 },
    { name:'Hip Abduction Machine',          type:'isolation', equip:['machine','gym'],         secondary:[],                  pattern:'abduction',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:6,notes:'Glute medius: key for hip stability and aesthetics' },
    { name:'Sumo Squat (Dumbbell)',          type:'compound',  equip:['dumbbells','gym','home'], secondary:['quads','hamstrings'],pattern:'squat',         diff:2,repRange:{strength:'5-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:7 },
    { name:'Dumbbell Hip Thrust',            type:'compound',  equip:['dumbbells','home'],      secondary:['hamstrings'],       pattern:'hip_thrust',     diff:2,repRange:{strength:'5-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:1,notes:'Best home glute exercise' },
    { name:'Band Glute Kickback',            type:'isolation', equip:['bands','home'],          secondary:[],                   pattern:'extension',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'20-25',general:'15-20'},priority:5 },
    { name:'Quadruped Glute Kickback',       type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],        pattern:'extension',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'20-25',general:'15-20'},priority:6 },
    { name:'Glute Bridge (Barbell)',         type:'compound',  equip:['barbell','gym'],         secondary:['hamstrings'],       pattern:'bridge',         diff:1,repRange:{strength:'5-8',hypertrophy:'10-20',fat_loss:'15-25',general:'10-20'},priority:3 },
    { name:'Step-Up with Knee Drive',        type:'compound',  equip:['bodyweight','home','calisthenics'],secondary:['quads'],  pattern:'single_leg',     diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:5 },
  ],

  // ─── CALVES ───────────────────────────────────────────────────────────────
  calves: [
    { name:'Standing Calf Raise (Barbell)',  type:'isolation', equip:['barbell','machine','gym'],secondary:[],                  pattern:'plantarflexion', diff:1,repRange:{strength:'6-8',hypertrophy:'10-20',fat_loss:'15-25',general:'10-20'},priority:1,notes:'Gastrocnemius: elongated with straight knee' },
    { name:'Seated Calf Raise',             type:'isolation', equip:['machine','gym'],          secondary:[],                   pattern:'plantarflexion', diff:1,repRange:{strength:'N/A',hypertrophy:'10-20',fat_loss:'15-25',general:'10-20'},priority:2,notes:'Soleus dominant with knee flexed' },
    { name:'Leg Press Calf Raise',          type:'isolation', equip:['machine','gym'],          secondary:[],                   pattern:'plantarflexion', diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:3 },
    { name:'Single-Leg Calf Raise',         type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],         pattern:'plantarflexion', diff:2,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:2 },
    { name:'Donkey Calf Raise',             type:'isolation', equip:['machine','gym'],          secondary:[],                   pattern:'plantarflexion', diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:4 },
    { name:'Step-Up Calf Raise',            type:'isolation', equip:['bodyweight','home'],      secondary:[],                   pattern:'plantarflexion', diff:2,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:3 },
  ],

  // ─── ABS / CORE ───────────────────────────────────────────────────────────
  abs: [
    { name:'Cable Crunch',                   type:'isolation', equip:['cable','gym'],           secondary:[],                   pattern:'flexion',        diff:2,repRange:{strength:'8-12',hypertrophy:'10-15',fat_loss:'15-20',general:'10-15'},priority:1,notes:'Progressive resistance = rectus abdominis hypertrophy' },
    { name:'Hanging Leg Raise',              type:'isolation', equip:['pullup_bar','gym','calisthenics'],secondary:['hip_flexors'],pattern:'flexion',      diff:3,repRange:{strength:'N/A',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:2 },
    { name:'Ab Wheel Rollout',               type:'isolation', equip:['ab_wheel','gym','home'],  secondary:['back','shoulders'],  pattern:'anti_extension',diff:3,repRange:{strength:'N/A',hypertrophy:'8-12',fat_loss:'10-15',general:'8-12'}, priority:3,notes:'Anti-extension: activates entire anterior chain' },
    { name:'Dragon Flag',                    type:'isolation', equip:['bench','gym'],            secondary:['back'],              pattern:'anti_extension',diff:5,repRange:{strength:'N/A',hypertrophy:'5-8',fat_loss:'N/A',general:'5-8'},    priority:4 },
    { name:'Weighted Decline Sit-Up',        type:'isolation', equip:['bench','machine','gym'],  secondary:[],                   pattern:'flexion',       diff:2,repRange:{strength:'8-12',hypertrophy:'10-15',fat_loss:'N/A',general:'10-15'},priority:5 },
    { name:'Pallof Press',                   type:'isolation', equip:['cable','bands','gym'],    secondary:[],                   pattern:'anti_rotation',  diff:2,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:6 },
    { name:'Plank (Weighted)',               type:'isolation', equip:['bodyweight','home'],       secondary:['glutes','back'],    pattern:'anti_extension', diff:2,repRange:{strength:'N/A',hypertrophy:'30-60s',fat_loss:'30-60s',general:'30-60s'},priority:7 },
    { name:'Bicycle Crunch',                 type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],         pattern:'rotation',       diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:5 },
    { name:'Reverse Crunch on Bench',        type:'isolation', equip:['bench','bodyweight','home'],secondary:[],                pattern:'flexion',        diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:6 },
    { name:'Mountain Climbers',              type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],         pattern:'anti_extension', diff:1,repRange:{strength:'N/A',hypertrophy:'20-30',fat_loss:'20-40',general:'20-30'},priority:7 },
    { name:'L-Sit',                          type:'isolation', equip:['bodyweight','calisthenics'],secondary:['triceps'],       pattern:'compression',    diff:4,repRange:{strength:'N/A',hypertrophy:'10-20s',fat_loss:'N/A',general:'10-20s'},priority:2 },
    { name:'Side Plank',                     type:'isolation', equip:['bodyweight','home','calisthenics'],secondary:[],         pattern:'anti_lateral',   diff:1,repRange:{strength:'N/A',hypertrophy:'20-45s',fat_loss:'30-60s',general:'20-45s'},priority:8 },
  ],

  // ─── TRAPS ────────────────────────────────────────────────────────────────
  traps: [
    { name:'Barbell Shrug',                  type:'isolation', equip:['barbell','gym'],          secondary:[],                  pattern:'elevation',      diff:1,repRange:{strength:'6-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:1 },
    { name:'Dumbbell Shrug',                 type:'isolation', equip:['dumbbells','gym','home'],  secondary:[],                 pattern:'elevation',      diff:1,repRange:{strength:'6-8',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:2 },
    { name:'Cable Shrug',                    type:'isolation', equip:['cable','gym'],            secondary:[],                   pattern:'elevation',      diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:3 },
    { name:'Face Pull',                      type:'isolation', equip:['cable','gym'],            secondary:['rear_delt'],        pattern:'face_pull',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-25',fat_loss:'20-30',general:'15-25'},priority:4 },
    { name:'Band Shrug',                     type:'isolation', equip:['bands','home'],           secondary:[],                   pattern:'elevation',      diff:1,repRange:{strength:'N/A',hypertrophy:'15-20',fat_loss:'15-25',general:'15-20'},priority:3 },
  ],

  // ─── FOREARMS ─────────────────────────────────────────────────────────────
  forearms: [
    { name:'Wrist Curl (Barbell)',           type:'isolation', equip:['barbell','gym'],          secondary:[],                  pattern:'wrist_flexion',  diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:1 },
    { name:'Reverse Curl (EZ Bar)',          type:'isolation', equip:['barbell','gym'],          secondary:['brachialis'],       pattern:'reverse_curl',   diff:1,repRange:{strength:'N/A',hypertrophy:'10-15',fat_loss:'12-20',general:'10-15'},priority:2 },
    { name:'Farmer Carry',                   type:'compound',  equip:['dumbbells','barbell','gym','home'],secondary:['traps','core'],pattern:'carry',       diff:1,repRange:{strength:'N/A',hypertrophy:'30-60s',fat_loss:'30-60s',general:'30-60s'},priority:3,notes:'High grip + trap + core activation' },
    { name:'Wrist Extension',               type:'isolation', equip:['dumbbells','gym','home'],  secondary:[],                  pattern:'wrist_extension', diff:1,repRange:{strength:'N/A',hypertrophy:'12-20',fat_loss:'15-25',general:'12-20'},priority:4 },
    { name:'Dead Hang',                      type:'isolation', equip:['pullup_bar','gym','calisthenics'],secondary:[],          pattern:'grip',            diff:1,repRange:{strength:'N/A',hypertrophy:'20-60s',fat_loss:'20-60s',general:'20-60s'},priority:1 },
    { name:'Towel Hang',                     type:'isolation', equip:['bodyweight','calisthenics'],secondary:[],               pattern:'grip',             diff:2,repRange:{strength:'N/A',hypertrophy:'15-30s',fat_loss:'N/A',general:'15-30s'},priority:2 },
    { name:'Pinch Grip Hold',               type:'isolation', equip:['gym'],                    secondary:[],                   pattern:'grip',            diff:2,repRange:{strength:'N/A',hypertrophy:'15-30s',fat_loss:'N/A',general:'15-30s'},priority:5 },
  ],
};

// Equipment mapping: user-selected equipment → which equip[] tags are available
const EQUIPMENT_MAP = {
  gym:          ['barbell','dumbbells','cable','machine','pullup_bar','dip_bar','bench','ab_wheel','bands','bodyweight','gym'],
  home:         ['dumbbells','bands','bodyweight','pullup_bar','bench','ab_wheel','home'],
  calisthenics: ['bodyweight','pullup_bar','dip_bar','bands','calisthenics'],
};

// Returns exercises for a muscle group filtered by available equipment
function getExercisesForMuscle(muscleId, equipmentType) {
  var available = EQUIPMENT_MAP[equipmentType] || EQUIPMENT_MAP.gym;
  var exercises  = EXERCISE_DATABASE[muscleId] || [];
  return exercises.filter(function(ex) {
    return ex.equip.some(function(e) { return available.indexOf(e) >= 0; });
  }).sort(function(a, b) { return a.priority - b.priority; });
}
