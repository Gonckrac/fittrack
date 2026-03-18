// ─── TRAINING DATA ────────────────────────────────────────────────
const TRAINING = {
  1: {
    name: "D1 — Push + Pull",
    supersets: [
      { label: "SS1 — Bench press + Chest supported row", id: "A_SS1" },
      { label: "SS2 — Incline dumbbell press + DB row unilateral", id: "A_SS2" },
      { label: "SS3 — Incline dumbbell fly + Overhead triceps extension", id: "A_SS3" },
      { label: "SS4 — EZ bar triceps extension + Ab wheel", id: "A_SS4" },
    ],
    exercises: [
      { name:"Bench press",                     muscle:"Pecho esternal, Tríceps",              sets:4, reps:"5-8",   noTopRep:false, ssGroup:"A_SS1", ssPart:"a" },
      { name:"Chest supported row",             muscle:"Dorsal, Romboides, Trapecio medio",    sets:4, reps:"6-10",  noTopRep:false, ssGroup:"A_SS1", ssPart:"b" },
      { name:"Incline dumbbell press",          muscle:"Pecho clavicular, Tríceps",            sets:3, reps:"8-12",  noTopRep:false, ssGroup:"A_SS2", ssPart:"a" },
      { name:"DB row unilateral",               muscle:"Dorsal, Redondo mayor",                sets:3, reps:"8-12",  noTopRep:false, ssGroup:"A_SS2", ssPart:"b" },
      { name:"Incline dumbbell fly",            muscle:"Pecho elongación máxima",              sets:3, reps:"10-15", noTopRep:false, ssGroup:"A_SS3", ssPart:"a" },
      { name:"Overhead triceps extension",      muscle:"Tríceps cabeza larga",                 sets:3, reps:"10-12", noTopRep:false, ssGroup:"A_SS3", ssPart:"b" },
      { name:"EZ bar triceps extension",        muscle:"Tríceps cabezas lateral/medial",       sets:2, reps:"10-12", noTopRep:false, ssGroup:"A_SS4", ssPart:"a" },
      { name:"Ab wheel",                        muscle:"Core — anti-extensión",                sets:3, reps:"8-12",  noTopRep:false, ssGroup:"A_SS4", ssPart:"b" },
    ]
  },
  2: {
    name: "D2 — Shoulders + Core",
    supersets: [
      { label: "SS1 — Lateral raise + Rear delt fly", id: "B_SS1" },
      { label: "SS2 — Reverse curl + Side plank", id: "B_SS2" },
    ],
    exercises: [
      { name:"External rotation",               muscle:"Manguito rotador, Infraespinoso",      sets:2, reps:"15-20", noTopRep:false, ssGroup:null },
      { name:"Dumbbell shoulder press",         muscle:"Deltoides anterior/medio, Tríceps",    sets:4, reps:"6-10",  noTopRep:false, ssGroup:null },
      { name:"Lateral raise",                   muscle:"Deltoides medio",                      sets:4, reps:"12-20", noTopRep:false, ssGroup:"B_SS1", ssPart:"a" },
      { name:"Rear delt fly",                   muscle:"Deltoides posterior, Infraespinoso",   sets:3, reps:"12-15", noTopRep:false, ssGroup:"B_SS1", ssPart:"b" },
      { name:"Reverse curl",                    muscle:"Braquiorradial, Extensores muñeca",    sets:3, reps:"10-12", noTopRep:false, ssGroup:"B_SS2", ssPart:"a" },
      { name:"Side plank",                      muscle:"Oblicuos, Core lateral",               sets:3, reps:"30-45s",noTopRep:true,  ssGroup:"B_SS2", ssPart:"b" },
      { name:"Bar hold",                        muscle:"Agarre isométrico, Antebrazos",        sets:3, reps:"20-30s",noTopRep:true,  ssGroup:null },
    ]
  },
  3: {
    name: "D3 — Pull (heavy)",
    supersets: [
      { label: "SS1 — Pull-up pronado + Rear delt row", id: "C_SS1" },
      { label: "SS2 — Barbell row + Hammer curl", id: "C_SS2" },
      { label: "SS3 — Pull-up neutro + Lateral raise", id: "C_SS3" },
    ],
    exercises: [
      { name:"Pull-up pronado",                 muscle:"Dorsal ancho, Bíceps",                 sets:5, reps:"5-8",   noTopRep:false, ssGroup:"C_SS1", ssPart:"a" },
      { name:"Rear delt row",                   muscle:"Deltoides posterior, Romboides",       sets:3, reps:"10-12", noTopRep:false, ssGroup:"C_SS1", ssPart:"b" },
      { name:"Barbell row",                     muscle:"Dorsal, Trapecio, Romboides",          sets:4, reps:"6-10",  noTopRep:false, ssGroup:"C_SS2", ssPart:"a" },
      { name:"Hammer curl",                     muscle:"Braquiorradial, Braquial anterior",    sets:3, reps:"10-12", noTopRep:false, ssGroup:"C_SS2", ssPart:"b" },
      { name:"Pull-up neutro",                  muscle:"Dorsal, Bíceps braquial",              sets:3, reps:"8-10",  noTopRep:false, ssGroup:"C_SS3", ssPart:"a" },
      { name:"Lateral raise",                   muscle:"Deltoides medio",                      sets:3, reps:"15-20", noTopRep:false, ssGroup:"C_SS3", ssPart:"b" },
      { name:"Farmer carry",                    muscle:"Agarre dinámico, Trapecio, Core",      sets:3, reps:"30-40m",noTopRep:true,  ssGroup:null },
    ]
  },
  4: {
    name: "D4 — Descanso",
    supersets: [],
    exercises: []
  },
  5: {
    name: "D5 — Push",
    supersets: [
      { label: "SS1 — Incline DB press + Lateral raise", id: "E_SS1" },
      { label: "SS2 — Dips + Overhead triceps extension", id: "E_SS2" },
      { label: "SS3 — EZ bar triceps extension + Ab wheel", id: "E_SS3" },
    ],
    exercises: [
      { name:"Incline DB press",                muscle:"Pecho clavicular, Tríceps",            sets:4, reps:"6-10",  noTopRep:false, ssGroup:"E_SS1", ssPart:"a" },
      { name:"Lateral raise",                   muscle:"Deltoides medio",                      sets:4, reps:"12-20", noTopRep:false, ssGroup:"E_SS1", ssPart:"b" },
      { name:"Dips",                            muscle:"Pecho inferior, Tríceps",              sets:3, reps:"8-12",  noTopRep:false, ssGroup:"E_SS2", ssPart:"a" },
      { name:"Overhead triceps extension",      muscle:"Tríceps cabeza larga",                 sets:3, reps:"10-12", noTopRep:false, ssGroup:"E_SS2", ssPart:"b" },
      { name:"EZ bar triceps extension",        muscle:"Tríceps cabezas lateral/medial",       sets:2, reps:"10-12", noTopRep:false, ssGroup:"E_SS3", ssPart:"a" },
      { name:"Ab wheel",                        muscle:"Core — anti-extensión",                sets:3, reps:"8-12",  noTopRep:false, ssGroup:"E_SS3", ssPart:"b" },
    ]
  },
  6: {
    name: "D6 — Pull + Arms",
    supersets: [
      { label: "SS1 — Pull-up supino + Incline curl", id: "F_SS1" },
      { label: "SS2 — Chest supported row + EZ bar curl", id: "F_SS2" },
      { label: "SS3 — Pull-up neutro + Rear delt fly", id: "F_SS3" },
    ],
    exercises: [
      { name:"Pull-up supino",                  muscle:"Dorsal, Bíceps supinado",              sets:5, reps:"6-10",  noTopRep:false, ssGroup:"F_SS1", ssPart:"a" },
      { name:"Incline curl",                    muscle:"Bíceps posición elongada",             sets:4, reps:"10-12", noTopRep:false, ssGroup:"F_SS1", ssPart:"b" },
      { name:"Chest supported row",             muscle:"Dorsal, Romboides, Trapecio medio",    sets:4, reps:"8-12",  noTopRep:false, ssGroup:"F_SS2", ssPart:"a" },
      { name:"EZ bar curl",                     muscle:"Bíceps cabeza corta, Braquial",        sets:3, reps:"10-12", noTopRep:false, ssGroup:"F_SS2", ssPart:"b" },
      { name:"Pull-up neutro",                  muscle:"Dorsal, Bíceps braquial",              sets:3, reps:"8-10",  noTopRep:false, ssGroup:"F_SS3", ssPart:"a" },
      { name:"Rear delt fly",                   muscle:"Deltoides posterior, Infraespinoso",   sets:3, reps:"12-15", noTopRep:false, ssGroup:"F_SS3", ssPart:"b" },
      { name:"Dead hang",                       muscle:"Agarre isométrico, Antebrazos",        sets:2, reps:"30-45s",noTopRep:true,  ssGroup:null },
    ]
  },
};

// Martes 24 Feb 2026 = día ON para suplementos "día por medio"
const EVERY_OTHER_REF = new Date('2026-02-24T00:00:00');

function isSuppActiveToday(s) {
  if (!s.everOther) return true;
  const today = new Date(TODAY + 'T00:00:00');
  const diffDays = Math.round((today - EVERY_OTHER_REF) / (1000 * 60 * 60 * 24));
  return diffDays % 2 === 0; // par = ON (hoy martes 24 y cada 2 días)
}

const SUPPS = [
  { id:"creatina",  name:"Creatina",       dose:"5g",        time:"Manana", group:"morning" },
  { id:"omega3",    name:"Omega 3",        dose:"diario",    time:"Manana", group:"morning" },
  { id:"d3k2",      name:"D3 + K2",        dose:"1 softgel", time:"Manana", group:"morning", everOther:true },
  { id:"vitc",      name:"Vitamina C",     dose:"1000 mg",   time:"Manana", group:"morning", everOther:true },
  { id:"magglicin", name:"Mag. Glicinato", dose:"160 mg",    time:"Noche",  group:"night"   },
];

