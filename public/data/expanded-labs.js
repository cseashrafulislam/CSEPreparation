// Parameterized, self-assessed practical case studies. No remote code execution.
export const expandedLabs = [];
const rubric = {
  Coding: ["Correct algorithm and sample output", "Complexity, safety and edge cases", "Explain invariant or core approach"],
  SQL: ["Correct rows/aggregation/ordering", "NULL and tie behavior", "Index and transaction caveats"],
  Written: ["Correct derivation", "Worked steps with units", "Assumptions and validation"],
};

function family(kind, topic, title, build) {
  const number = expandedLabs.length / 20 + 1;
  for (let seed=1; seed<=20; seed++) {
    const [prompt, hint, solution, check] = build(seed);
    expandedLabs.push({
      id: `case-${String(number).padStart(2,"0")}-${String(seed).padStart(2,"0")}`,
      title: `${title} · Case ${seed}`, topic, kind,
      difficulty: seed % 4 ? "Hard" : "Medium", prompt, hint, solution, check,
      sourceKind: "Parameterized practical scenario", rubric: rubric[kind],
    });
  }
}

family("Coding","Algorithms","Two-sum index pairs", i=> {
  const a=2+i,b=7+i*3,target=a+b;
  return [`Given A=[${a},${b},${a+1},${b+9}] and target=${target}, return first valid distinct zero-based index pair using O(n) expected time. Also implement general solution.`,"Check complement before inserting into map.",`Expected sample pair: (0,1). General solution: for j in 0..n−1, if map has target−A[j] return (map[target−A[j]],j); otherwise map[A[j]]=j. Return (-1,-1) when none. Time O(n) expected, space O(n).`,`Test duplicates, negative numbers and no solution; verify ${a}+${b}=${target}.`];
});
family("Coding","Algorithms","Sliding window fixed length", i=> {
  const k=2+i%5, arr=Array.from({length:10},(_,j)=>i+j%7), sums=arr.slice(0,10-k+1).map((_,j)=>arr.slice(j,j+k).reduce((x,y)=>x+y,0)), best=Math.max(...sums);
  return [`Implement max-sum contiguous subarray of exact length k=${k}. Sample A=[${arr.join(",")}] → expected maximum? Target O(n).`,`Initialize sum for first k elements, then add right and subtract outgoing left.`,`Sample result: ${best}. Algorithm: s=sum(A[0..k-1]); best=s; for r=k..n-1: s+=A[r]-A[r-k]; best=max(best,s). O(n) time and O(1) extra space.`,`Handle k=1, k=n, and invalid k; expected ${best}.`];
});
family("Coding","Data Structures","Queue simulation", i=> {
  const first=10+i, second=20+i, third=30+i;
  return [`Implement a FIFO queue; execute enqueue(${first}), enqueue(${second}), dequeue(), enqueue(${third}), dequeue(). Give outputs and remaining queue.`,`Maintain head/tail or a deque; dequeue earliest inserted.`,`Outputs [${first},${second}], remaining queue [${third}]. Use a linked queue or circular buffer: enqueue at tail; dequeue at head in O(1).`,`Test empty queue, single element and underflow; never shift O(n) arrays in performance-sensitive code.`];
});
family("Coding","Algorithms","Binary search insertion index", i=> {
  const base=i*2,k=2+i%5,arr=Array.from({length:9},(_,j)=>base+j*k),target=base+4*k-1;
  return [`Implement lower_bound on sorted array [${arr.join(",")}] for target ${target}. Return zero-based insertion index and general O(log n) algorithm.`,`Half-open interval [lo,hi) invariant.`,`Expected index 4. lo=0; hi=n; while lo<hi: mid=floor((lo+hi)/2); if A[mid]<target then lo=mid+1 else hi=mid; return lo. O(log n).`,`Test duplicates, target before first/after last, and empty input.`];
});
family("Coding","Programming","GCD using Euclid", i=> {
  const a=100+i*9,b=37+i*3;let x=a,y=b;while(y){[x,y]=[y,x%y];}
  return [`Write an iterative Euclidean gcd function. Show each remainder step for gcd(${a},${b}) and return value.`,`Use (a,b)=(b,a mod b) until b is zero.`,`Expected gcd=${x}. Pseudocode: while b!=0: t=a%b; a=b; b=t; return abs(a). O(log min(a,b)) iterations.`,`Handle 0 and negative inputs; justify the gcd invariant.`];
});
family("Coding","Algorithms","Prefix sum range queries", i=> {
  const arr=Array.from({length:8},(_,j)=>j+1+i%6),l=i%4,r=l+3,sum=arr.slice(l,r+1).reduce((a,b)=>a+b,0);
  return [`Build prefix sums for A=[${arr.join(",")}]. Answer inclusive query [${l},${r}] in O(1), show reusable procedure.`,`P[0]=0 and P[t+1]=P[t]+A[t].`,`Result ${sum}. Build prefix array P; rangeSum(l,r)=P[r+1]−P[l]. Build O(n), query O(1); use sufficiently wide integer.`,`Test l=r, entire array and invalid bounds.`];
});
family("Coding","Algorithms","Dynamic programming stairs", i=> {
  const steps=4+i, a=1,b=1;let prev=1,curr=1;for(let j=2;j<=steps;j++){[prev,curr]=[curr,prev+curr];}
  return [`Staircase: at each move climb 1 or 2 stairs. Compute ways to reach n=${steps}. Implement DP with O(1) space.`,`ways(0)=1, ways(1)=1, ways(n)=ways(n-1)+ways(n-2).`,`Expected ${curr} ways. Keep two prior values and iterate to n; O(n) time, O(1) auxiliary space.`,`Validate n=0,1,2, and choose BigInt for large n.`];
});
family("Coding","Data Structures","Circular buffer index", i=> {
  const cap=5+i%8, head=2+i%3, offset=7+i, idx=(head+offset)%cap;
  return [`Implement ring-buffer indexing with capacity ${cap}, head=${head}, logical offset=${offset}. Compute physical index, explain enqueue/dequeue and overflow.`,`Wrap indices modulo capacity.`,`Logical mapping (head+offset)%capacity = (${head}+${offset})%${cap}=${idx}. Track size separately to distinguish full from empty; O(1) enqueue/dequeue.`,`Test wraparound, full buffer and a zero capacity guard.`];
});
family("SQL","DBMS & SQL","Nth highest distinct salary", i=> {
  const rank=2+i%5, department=10+i;
  return [`Employees(Id,DepartmentId,Salary): return all employees in department ${department} with the ${rank}th-highest DISTINCT salary. Include ties. Write a portable window-function query.`,`Use DENSE_RANK() partitioned by DepartmentId.`,`WITH ranked AS (SELECT e.*, DENSE_RANK() OVER(PARTITION BY DepartmentId ORDER BY Salary DESC) AS r FROM Employees e WHERE DepartmentId=${department}) SELECT Id,DepartmentId,Salary FROM ranked WHERE r=${rank};`,"Test ties and too few distinct salaries. Index (DepartmentId, Salary DESC) may help."];
});
family("SQL","DBMS & SQL","HAVING aggregate filter", i=> {
  const cutoff=5000+i*100;
  return [`Orders(Id,CustomerId,Amount): return CustomerId and SUM(Amount) only when total amount is strictly over ${cutoff}. Sort by SUM descending.`,`WHERE filters rows; HAVING filters groups.`,`SELECT CustomerId, SUM(Amount) AS Total FROM Orders GROUP BY CustomerId HAVING SUM(Amount)>${cutoff} ORDER BY Total DESC;`,"Test zero orders, NULL Amount, equality to cutoff and duplicate rows."];
});
family("SQL","DBMS & SQL","Cursor pagination", i=> {
  const cursor=100+i*7,limit=5+i%10;
  return [`Jobs(Id PRIMARY KEY, Title): fetch next ${limit} jobs after last seen Id=${cursor}, ascending, safely for large datasets.`,`Use keyset predicate Id > @lastId, parameterized query.`,`SELECT Id,Title FROM Jobs WHERE Id>@lastId ORDER BY Id ASC FETCH FIRST ${limit} ROWS ONLY; with @lastId=${cursor}. Substitute LIMIT ${limit} for dialects such as PostgreSQL/MySQL. Use a seek on PK.`,`For SQL Server use SELECT TOP (${limit}) ... WHERE Id>@lastId ORDER BY Id. Test empty page and concurrent inserts.`];
});
family("SQL","DBMS & SQL","Monthly salary totals", i=> {
  const year=2020+i%7, month=1+i%12, nextYear=month===12?year+1:year, nextMonth=month===12?1:month+1;
  const from=`${year}-${String(month).padStart(2,"0")}-01`,to=`${nextYear}-${String(nextMonth).padStart(2,"0")}-01`;
  return [`Salaries(EmployeeId,PaymentDate,Amount): return total payroll between ${from} inclusive and ${to} exclusive using an indexed date predicate.`,`Use half-open date range and SUM(COALESCE(Amount,0)).`,`SELECT COALESCE(SUM(Amount),0) AS Payroll FROM Salaries WHERE PaymentDate>=@from AND PaymentDate<@to; @from='${from}', @to='${to}'.`,`Do not use MONTH(PaymentDate) filter alone; test leap years, timestamp boundaries and no rows.`];
});
family("Written","Operating System","FIFO page replacement", i=> {
  const frames=2+i%3,ref=Array.from({length:9},(_,j)=>(j*2+i+j%3)%6),set=new Set(),order=[];let faults=0;
  for(const page of ref){if(set.has(page))continue;faults++;if(order.length===frames)set.delete(order.shift());order.push(page);set.add(page);}
  return [`Simulate FIFO page replacement with ${frames} initially empty frames on reference string [${ref.join(",")}]. Draw frame states and count page faults.`,`Evict oldest resident page on miss; hits do not change FIFO order.`,`Expected faults: ${faults}. Maintain set of residents and queue of insertion order; on miss, evict head when full and append new page.`,`Show each reference as hit/fault and frame content; compare with LRU if time remains.`];
});
family("Written","Operating System","Nonpreemptive SJF", i=> {
  const a=2+i,b=4+i%9,c=a+b+3,wait=2*a+b;
  return [`All jobs arrive t=0: burst lengths are [${c},${b},${a}] ms. Nonpreemptive SJF: draw Gantt order and sum waiting times.`,`Sort by burst ascending, then accumulate prefixes.`,`SJF order ${a}→${b}→${c} if ${a}<=${b}; waiting sum=0+${a}+(${a}+${b})=${wait}. If ${a}>${b}, order ${b}→${a}→${c}; waiting sum=0+${b}+(${a}+${b})=${a+2*b}.`,`Handle ties explicitly, compute average waiting and completion. Use proper sorted order.`];
});
family("Written","Networking","Subnet usable hosts", i=> {
  const prefix=24+i%7,total=2**(32-prefix),usable=total-2;
  return [`For conventional IPv4 subnet 10.12.${i}.0/${prefix}, derive address count, usable hosts and network/broadcast rules.`,`Host bits = 32−prefix. Exclude /31 and /32 exceptions.`,`Host bits ${32-prefix}, total ${total}, conventional usable ${usable}. Network is first address and broadcast last of the aligned block; verify any supplied address is subnet-aligned.`,`Explain why /31 and /32 use different conventions.`];
});
family("Written","Computer Architecture","Cache AMAT sensitivity", i=> {
  const hit=1+i%7,rate=2+i%13,penalty=30+i*3,amat=hit+rate/100*penalty;
  return [`Hit time ${hit}ns, miss rate ${rate}%, extra miss penalty ${penalty}ns. Compute AMAT, then show AMAT if miss rate is halved.`,`AMAT=hit time+miss probability×additional miss penalty.`,`Initial AMAT=${amat.toFixed(2)} ns; after halving misses: ${(hit+rate/200*penalty).toFixed(2)} ns. Assumes penalty/hit unchanged.`,`Units, relative improvement and difference between additional penalty vs total miss cost.`];
});
family("Written","Security","Exponential backoff threat analysis", i=> {
  const base=2+i%5,max=60+i,attempts=3+i%6,delay=Math.min(max,base*2**(attempts-1));
  return [`Login defense exercise: base backoff ${base}s, cap ${max}s after ${attempts} failed attempts. Calculate next delay and explain account-lockout abuse mitigations.`,`Use cap and retry count; avoid revealing account existence in error messages.`,`Delay=min(${max},${base}×2^${attempts-1})=${delay}s. Pair throttling with IP/account signals, MFA, audit logs, generic responses and recovery.`,`Rate limits must balance brute-force defense, denial-of-service and accessibility.`];
});
family("Written","Mathematics","Work and time planning", i=> {
  const a=5+i,b=8+i,c=i%4?2:3;const time=a*b/(a+b);
  return [`Worker A completes task in ${a} days, B in ${b} days. Derive joint completion time (2 decimals); explain rate-based reasoning.`,`Rates per day are 1/a and 1/b.`,`Combined daily work=1/${a}+1/${b}; time=(${a}×${b})/(${a}+${b})=${time.toFixed(2)} days. If they work only ${c} days, completion fraction=${(c*(a+b)/(a*b)).toFixed(4)}.`,`Use consistent units and distinguish time from rate.`];
});

export const EXPANDED_LAB_CASES = expandedLabs.length;
