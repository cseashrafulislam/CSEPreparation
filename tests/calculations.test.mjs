import test from "node:test";
import assert from "node:assert/strict";
import { numericalScenarioRows } from "../public/data/numerical-scenarios.js";

const num = value => Number(value);
function independentlyCheck(prompt) {
  let m;
  if ((m = /^FCFS: P1=(\d+)ms, P2=(\d+)ms, P3=(\d+)ms/.exec(prompt)))
    return String(2*num(m[1])+num(m[2]));
  if ((m = /^SJF nonpreemptive:.*burst times (\d+), (\d+), (\d+) ms/.exec(prompt))) {
    const [a,b] = m.slice(1).map(num).sort((x,y) => x-y);
    return String(2*a+b);
  }
  if ((m = /^Round Robin,.*quantum=(\d+)ms; burst=\[(\d+),(\d+),(\d+)\]ms/.exec(prompt))) {
    const [quantum,...burst] = m.slice(1).map(num);
    const left = [...burst], queue = [0,1,2];
    let time = 0, completion = null;
    while (queue.length) {
      const p = queue.shift(), worked = Math.min(quantum, left[p]);
      left[p]-=worked;time+=worked;
      if (left[p]===0 && p===1) completion=time;
      else if (left[p]>0) queue.push(p);
    }
    return String(completion);
  }
  if ((m = /^FIFO page replacement with (\d+) empty frames\. Reference string: ([0-9 ]+)\. Count/.exec(prompt))) {
    const [frameLimit, sequence] = [num(m[1]),m[2].split(" ").map(num)];
    const memory = [], hits = new Set();
    let misses = 0;
    for (const page of sequence) {
      if (hits.has(page)) continue;
      misses++;
      if (memory.length===frameLimit) hits.delete(memory.shift());
      memory.push(page); hits.add(page);
    }
    return String(misses);
  }
  if ((m = /^For a conventional IPv4 \/(\d+) subnet/.exec(prompt)))
    return String(2**(32-num(m[1]))-2);
  if ((m = /^IPv4 192\.168\.\d+\.(\d+)\/(\d+) belongs/.exec(prompt))) {
    const block=2**(32-num(m[2]));return String(Math.floor(num(m[1])/block)*block);
  }
  if ((m = /^Cache: hit=(\d+)ns, miss rate=(\d+)%, additional miss penalty=(\d+)ns/.exec(prompt)))
    return (num(m[1])+num(m[2])*num(m[3])/100).toFixed(1);
  if ((m = /^CPU runs (\d+) million instructions, CPI=(\d+), frequency=(\d+) GHz/.exec(prompt)))
    return (num(m[1])*num(m[2])/num(m[3])).toFixed(2);
  if ((m = /^Choose (\d+) people from (\d+) distinct applicants/.exec(prompt))) {
    const k=num(m[1]),n=num(m[2]);let r=1;
    for(let i=1;i<=k;i++)r=r*(n-i+1)/i;
    return String(Math.round(r));
  }
  if ((m = /^Worker A takes (\d+) days, B takes (\d+) days/.exec(prompt)))
    return (num(m[1])*num(m[2])/(num(m[1])+num(m[2]))).toFixed(2);
  if ((m = /^Table Sales has three rows with Amount=\[(\d+),(\d+),(\d+)\].*Amount>=(\d+)/.exec(prompt)))
    return String(m.slice(1,4).map(num).filter(v=>v>=num(m[4])).reduce((a,b)=>a+b,0));
  if ((m = /^Find bitwise XOR of decimal (\d+) and (\d+)/.exec(prompt)))
    return String(num(m[1])^num(m[2]));
  if ((m = /^Sorted array A=\[0,2,4,\.\.\.,(\d+)\] \((\d+) elements\)\. Lower_bound index of target (\d+)/.exec(prompt)))
    return String(Math.min(num(m[2]),Math.ceil(num(m[3])/2)));
  throw new Error(`Unrecognized numeric scenario: ${prompt}`);
}

test("all numerical scenario keys are recomputed independently from the question", () => {
  assert.ok(numericalScenarioRows.length >= 1400);
  for (const row of numericalScenarioRows) {
    const [topic, difficulty, prompt, options, answer] = row;
    assert.equal(String(options[answer]), independentlyCheck(prompt), `${topic}/${difficulty}: ${prompt}`);
  }
});
