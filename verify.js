const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cjqniznoswnepadbvfqq.supabase.co';
const supabaseKey = 'sb_publishable_DPjwSIc78nqkZjepfgSx2Q_7ra6nfUT';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const dummyStudent = {
    nombre: "Alumno Prueba Automatizada",
    grupo_id: null,
    estado: "Activo",
    progreso: 12,
    observaciones: "Prueba desde Node",
    fecha_inicio: new Date().toISOString().split('T')[0]
  };

  console.log("Attempting insert:", dummyStudent);
  const { data, error } = await supabase.from('alumnos').insert([dummyStudent]).select();
  if (error) {
    console.error("Insert failed!", error);
    process.exit(1);
  }
  console.log("Insert success!", data);

  const { data: fetch, err: fetchErr } = await supabase.from('alumnos').select('*').eq('id', data[0].id);
  if (fetchErr) {
    console.error("Fetch failed", fetchErr);
    process.exit(1);
  }
  console.log("Fetch success!", fetch);

  // Clean up
  await supabase.from('alumnos').delete().eq('id', data[0].id);
  console.log("Test completely successful.");
}

testInsert();
