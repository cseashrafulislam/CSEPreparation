// Parameterized calculation cases for repeated exam numericals.
// Each prompt is a checked exercise variant; the large count is NOT that many
// independent conceptual topics or verified historical exam questions.
export const numericalScenarioRows = [];
let serial = 0;

function add(topic, difficulty, prompt, correct, otherValues, english, bangla) {
  const answerText = String(correct);
  const options = [answerText, ...otherValues.map(String)];
  if (new Set(options).size !== 4) throw new Error(`Ambiguous scenario: ${prompt}`);
  const target = (serial * 7 + 2) % 4;
  options.splice(0, 1);
  options.splice(target, 0, answerText);
  numericalScenarioRows.push([topic, difficulty, prompt, options, target, english, bangla]);
  serial++;
}

// Scheduling: all processes arrive at 0, so FCFS waiting is prefix burst sum.
for (let a = 3; a <= 20; a++) {
  for (let b = 4; b <= 10; b++) {
    const c = a + b + 2;
    const totalWait = 2*a + b;
    add("Operating System", "Hard", `FCFS: P1=${a}ms, P2=${b}ms, P3=${c}ms, all arrive at t=0 in P1→P2→P3 order. Sum of all waiting times (ms)?`, totalWait,
      [totalWait+1,totalWait+a,totalWait+c], `Waiting: P1=0, P2=${a}, P3=${a+b}; total ${totalWait}ms.`, `FCFS-এ waiting ০+${a}+${a+b}=${totalWait} ms।`);
  }
}
// Three-job nonpreemptive shortest-job-first when all arrive together.
for (let smallest = 2; smallest <= 13; smallest++) {
  for (let gap = 1; gap <= 8; gap++) {
    const m = smallest + gap, l = m + gap + 1;
    const sumWaiting = 2*smallest + m;
    add("Operating System", "Hard", `SJF nonpreemptive: all jobs arrive together with burst times ${l}, ${smallest}, ${m} ms. Sum of waiting times (ms)?`, sumWaiting,
      [sumWaiting+smallest,sumWaiting+m,sumWaiting+1], `SJF order ${smallest},${m},${l}; waits 0,${smallest},${smallest+m}; total ${sumWaiting}.`, `SJF ছোট burst আগে: waiting sum ${smallest}+${smallest+m}=${sumWaiting}।`);
  }
}

// Round Robin simulation with explicit tie and arrival rules.
function rrCompletion(bursts, quantum) {
  const remaining = [...bursts];
  const finished = Array(bursts.length).fill(null);
  const queue = bursts.map((_, i) => i);
  let clock = 0;
  while (queue.length) {
    const id = queue.shift();
    const run = Math.min(quantum, remaining[id]);
    clock += run;
    remaining[id] -= run;
    if (remaining[id] === 0) finished[id] = clock;
    else queue.push(id);
  }
  return finished;
}
for (let a = 2; a <= 18; a++) {
  for (let q = 2; q <= 7; q++) {
    const bursts = [a, a+2, a+5];
    const finished = rrCompletion(bursts, q);
    const correct = finished[1];
    add("Operating System", "Hard", `Round Robin, all arrive at t=0 in P1→P2→P3 order; quantum=${q}ms; burst=[${bursts.join(",")}]ms. Completion time of P2 (ms)?`, correct,
      [correct+1,correct+q,correct+q+1], `Simulate circular queue until P2 finishes at t=${correct}ms. Completion=turnaround because arrival=0.`, `RR queue-তে quantum ${q} করে চালালে P2 t=${correct} ms-এ শেষ হয়।`);
  }
}

// FIFO page replacement; reference strings vary with seed; faults computed.
function fifoFaults(reference, frames) {
  const memory = new Set(), order = [];
  let faults = 0;
  for (const page of reference) {
    if (memory.has(page)) continue;
    faults++;
    if (order.length === frames) memory.delete(order.shift());
    memory.add(page); order.push(page);
  }
  return faults;
}
for (let seed = 10; seed <= 120; seed++) {
  const frames = seed % 2 ? 3 : 4;
  let randomState = (Math.imul(seed, 2654435761) ^ 0x9e3779b9) >>> 0;
  const reference = Array.from({ length: 9 }, () => {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return (randomState >>> 0) % 7;
  });
  const faults = fifoFaults(reference, frames);
  add("Operating System", "Hard", `FIFO page replacement with ${frames} empty frames. Reference string: ${reference.join(" ")}. Count page faults.`, faults,
    [faults+1,faults+2,faults+3], `Load on miss and evict oldest resident page; ${faults} page faults.`, `FIFO-তে miss হলে পুরোনো পেজ বাদ দিয়ে গণনায় ${faults} fault।`);
}

// Address calculations, deliberately excluding /31 and /32 host exceptions.
for (let third = 11; third <= 25; third++) {
  for (let prefix = 25; prefix <= 30; prefix++) {
    const bits = 32 - prefix;
    const total = 2 ** bits;
    const usable = total-2;
    add("Networking", "Hard", `For a conventional IPv4 /${prefix} subnet within 10.20.${third}.0/24, how many usable host addresses are in ONE /${prefix} subnet?`, usable,
      [total,usable+1,usable+3], `Host bits=${bits}; 2^${bits}=${total} total, minus network/broadcast =${usable}.`, `/`+`${prefix} এ ${bits} host bit; usable ${total}−২=${usable}।`);
  }
}
for (let third = 21; third <= 34; third++) {
  for (let host = 19; host <= 115; host += 12) {
    const prefix = 26 + (third % 3);
    const block = 2 ** (32 - prefix);
    const network = Math.floor(host/block)*block;
    add("Networking", "Hard", `IPv4 192.168.${third}.${host}/${prefix} belongs to which network address? Give last octet only.`, network,
      [network+1,network+block,network+block+1], `Block size=${block}; floor(${host}/${block})×${block}=${network}.`, `Block size ${block}; ${host} হলো ${network} থেকে শুরু subnet-এ।`);
  }
}

// AMAT: hit ns + (miss percent × penalty) ns, results exact to 1 decimal.
for (let hit = 1; hit <= 7; hit++) {
  for (let miss = 2; miss <= 16; miss += 2) {
    const penalty = 20 + hit*10;
    const result = (hit + miss/100*penalty).toFixed(1);
    const n = Number(result);
    add("Computer Architecture", "Hard", `Cache: hit=${hit}ns, miss rate=${miss}%, additional miss penalty=${penalty}ns. AMAT in ns?`, result,
      [(n+1).toFixed(1),(n+2).toFixed(1),(n+3).toFixed(1)], `AMAT=${hit}+${miss}/100×${penalty}=${result}ns.`, `AMAT=${hit}+miss rate×penalty=${result} ns।`);
  }
}
// CPU runtime ms: million instructions * CPI / GHz clock.
for (let million = 18; million <= 70; million += 2) {
  for (let clock = 2; clock <= 5; clock++) {
    const cpi = 1 + (million % 3);
    const result = (million*cpi/clock).toFixed(2);
    const n = Number(result);
    add("Computer Architecture", "Hard", `CPU runs ${million} million instructions, CPI=${cpi}, frequency=${clock} GHz. Approximate execution time in milliseconds?`, result,
      [(n+1).toFixed(2),(n+2).toFixed(2),(n+3).toFixed(2)], `Cycles=${million}M×${cpi}; time=${million}×${cpi}/${clock}=${result}ms.`, `মোট cycles ÷ GHz করে সময় ${result} ms।`);
  }
}

function combination(n,k) {
  let total = 1;
  for (let i = 1; i <= k; i++) total = total * (n-i+1) / i;
  return Math.round(total);
}
for (let n = 9; n <= 22; n++) {
  for (let k = 2; k <= 7; k++) {
    const result = combination(n,k);
    add("Mathematics", "Hard", `Choose ${k} people from ${n} distinct applicants, ignoring order. Number of possible teams?`, result,
      [result+1,result+k,result+n], `C(${n},${k})=${n}!/[${k}!(${n}-${k})!]=${result}.`, `ক্রম ছাড়া ${n} থেকে ${k} জন বাছাই C(${n},${k})=${result}।`);
  }
}
for (let a = 9; a <= 20; a++) {
  for (let b = 13; b <= 25; b += 3) {
    const result = (a*b/(a+b)).toFixed(2);
    const x = Number(result);
    add("Mathematics", "Hard", `Worker A takes ${a} days, B takes ${b} days to finish alone. Together, time (days) rounded to 2 decimals?`, result,
      [(x+1).toFixed(2),(x+2).toFixed(2),(x+3).toFixed(2)], `Combined rate=1/${a}+1/${b}; time=${a*b}/(${a}+${b})=${result}.`, `একসাথে সময় ab/(a+b)=${result} দিন।`);
  }
}

// SQL result interpretation, not merely memorizing keyword definitions.
for (let a = 3; a <= 19; a++) {
  for (let gap = 1; gap <= 8; gap++) {
    const b = a + gap;
    const c = 2*a + b;
    const minimum = a + 1;
    const result = b + c;
    add("DBMS & SQL", "Hard", `Table Sales has three rows with Amount=[${a},${b},${c}]. Query: SELECT SUM(CASE WHEN Amount>=${minimum} THEN Amount ELSE 0 END) FROM Sales; Result?`, result,
      [result+a,result+b,result+1], `Only ${b} and ${c} are ≥${minimum}; SUM=${result}.`, `CASE-এ ${a} বাদ, ${b}+${c}=${result}।`);
  }
}

// Discrete mathematics: truth table satisfiability for XOR/implication expressions.
for (let a = 8; a <= 35; a++) {
  for (let b = 4; b <= 12; b++) {
    const result = a ^ b;
    add("Digital Logic", "Medium", `Find bitwise XOR of decimal ${a} and ${b}. Answer in decimal.`, result,
      [result+1,result+2,result+3], `${a.toString(2)} XOR ${b.toString(2)}=${result.toString(2)}₂=${result}.`, `Bit আলাদা হলে XOR=১, ফল ${result}।`);
  }
}

// Binary-search lower bound in a sorted even-number array, including beyond last element.
for (let length = 11; length <= 27; length++) {
  for (let target = 5; target <= 39; target += 4) {
    const result = Math.min(length,Math.ceil(target/2));
    add("Algorithms", "Hard", `Sorted array A=[0,2,4,...,${2*(length-1)}] (${length} elements). Lower_bound index of target ${target} (first A[i]>=target; n if absent)?`, result,
      [result+1,result+2,result+3], `For even sequence, first eligible index ceil(${target}/2), clamped to n=${length}: ${result}.`, `Lower bound হলো প্রথম >=${target} index: ${result}।`);
  }
}

// Total deliberately reflects number of parameterized tasks, not distinct concepts.
