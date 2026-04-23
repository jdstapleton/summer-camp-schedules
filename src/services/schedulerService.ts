import type {
  Camp,
  CampInstance,
  CampRegistration,
  GeneratedSchedule,
  ScheduleData,
  Student,
} from '@/models/types';

const MIN_GIRLS_PER_INSTANCE = 4;
const MIN_BOYS_PER_INSTANCE = 2;

export function generateSchedule(data: ScheduleData): GeneratedSchedule {
  const studentMap = new Map(data.students.map((s) => [s.id, s]));
  const campMap = new Map(data.camps.map((c) => [c.id, c]));
  const instances: CampInstance[] = [];

  for (const registration of data.registrations) {
    const camp = campMap.get(registration.campId);
    if (!camp) continue;
    instances.push(...splitIntoInstances(registration, camp, studentMap));
  }

  return { instances };
}

function splitIntoInstances(
  registration: CampRegistration,
  camp: Camp,
  studentMap: Map<string, Student>
): CampInstance[] {
  const { campId, studentIds, friendGroups } = registration;
  const { maxSize } = camp;

  if (studentIds.length === 0) return [];

  const numInstances = Math.ceil(studentIds.length / maxSize);
  const buckets: string[][] = Array.from({ length: numInstances }, () => []);

  if (numInstances === 1) {
    buckets[0] = [...studentIds];
    return makeCampInstances(campId, buckets);
  }

  const studentSet = new Set(studentIds);
  const assigned = new Set<string>();

  // Phase 1: Assign friend groups first (exempt from gender minimums)
  for (const group of friendGroups) {
    const valid = group.filter((id) => studentSet.has(id) && !assigned.has(id));
    if (valid.length === 0) continue;

    // Prefer the tightest-fitting bucket that has room for the whole group
    const targetIdx =
      buckets
        .map((b, i) => ({ i, room: maxSize - b.length }))
        .filter(({ room }) => room >= valid.length)
        .sort((a, b) => a.room - b.room)[0]?.i ?? smallestBucketIndex(buckets);

    buckets[targetIdx].push(...valid);
    valid.forEach((id) => assigned.add(id));
  }

  // Phase 2: Distribute remaining students evenly by gender with minimums.
  // Girls: at least MIN_GIRLS_PER_INSTANCE per instance, or none.
  // Boys: at least MIN_BOYS_PER_INSTANCE per instance, or none.
  const remaining = studentIds
    .filter((id) => !assigned.has(id))
    .map((id) => studentMap.get(id))
    .filter((s): s is Student => s !== undefined);

  const girls = remaining.filter((s) => s.gender === 'female');
  const boys = remaining.filter((s) => s.gender === 'male');
  const others = remaining.filter(
    (s) => s.gender !== 'female' && s.gender !== 'male'
  );

  const girlInstanceCount =
    girls.length === 0
      ? 0
      : Math.min(
          numInstances,
          Math.max(1, Math.floor(girls.length / MIN_GIRLS_PER_INSTANCE))
        );
  distributeGender(
    girls,
    buckets,
    bucketIndicesBySize(buckets).slice(0, girlInstanceCount),
    maxSize
  );

  const boyInstanceCount =
    boys.length === 0
      ? 0
      : Math.min(
          numInstances,
          Math.max(1, Math.floor(boys.length / MIN_BOYS_PER_INSTANCE))
        );
  distributeGender(
    boys,
    buckets,
    bucketIndicesBySize(buckets).slice(0, boyInstanceCount),
    maxSize
  );

  distributeGender(others, buckets, bucketIndicesBySize(buckets), maxSize);

  return makeCampInstances(campId, buckets);
}

// Distribute students across the given bucket indices as evenly as possible,
// respecting maxSize. Any overflow spills into any bucket with remaining capacity.
function distributeGender(
  students: Student[],
  buckets: string[][],
  targetIndices: number[],
  maxSize: number
): void {
  if (students.length === 0 || targetIndices.length === 0) return;
  let idx = 0;
  for (let i = 0; i < targetIndices.length && idx < students.length; i++) {
    const bucketIdx = targetIndices[i];
    const studentsLeft = students.length - idx;
    const bucketsLeft = targetIndices.length - i;
    const toAdd = Math.min(
      Math.ceil(studentsLeft / bucketsLeft),
      maxSize - buckets[bucketIdx].length
    );
    for (let j = 0; j < toAdd && idx < students.length; j++) {
      buckets[bucketIdx].push(students[idx++].id);
    }
  }
  // Overflow: spill remaining into any bucket with capacity
  for (let b = 0; b < buckets.length && idx < students.length; b++) {
    while (idx < students.length && buckets[b].length < maxSize) {
      buckets[b].push(students[idx++].id);
    }
  }
}

function bucketIndicesBySize(buckets: string[][]): number[] {
  return buckets
    .map((b, i) => ({ i, size: b.length }))
    .sort((a, b) => a.size - b.size)
    .map((x) => x.i);
}

function smallestBucketIndex(buckets: string[][]): number {
  return buckets.reduce(
    (minI, b, i, arr) => (b.length < arr[minI].length ? i : minI),
    0
  );
}

function makeCampInstances(
  campId: string,
  buckets: string[][]
): CampInstance[] {
  return buckets.map((studentIds, i) => ({
    id: `${campId}-${i + 1}`,
    campId,
    instanceNumber: i + 1,
    studentIds,
  }));
}
