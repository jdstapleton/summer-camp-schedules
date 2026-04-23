import type {
  Camp,
  CampInstance,
  CampRegistration,
  GeneratedSchedule,
  ScheduleData,
  Student,
} from '@/models/types';

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

  const genderOrder: Record<string, number> = { male: 0, female: 1, other: 2 };
  const remaining = studentIds
    .filter((id) => !assigned.has(id))
    .map((id) => studentMap.get(id))
    .filter((s): s is Student => s !== undefined)
    .sort(
      (a, b) => (genderOrder[a.gender] ?? 2) - (genderOrder[b.gender] ?? 2)
    );

  // Fill buckets sequentially with gender-sorted students so same-gender
  // students naturally land in the same instance
  let idx = 0;
  for (let i = 0; i < buckets.length && idx < remaining.length; i++) {
    const studentsLeft = remaining.length - idx;
    const bucketsLeft = buckets.length - i;
    const toAdd = Math.min(
      Math.ceil(studentsLeft / bucketsLeft),
      maxSize - buckets[i].length
    );
    for (let j = 0; j < toAdd && idx < remaining.length; j++) {
      buckets[i].push(remaining[idx++].id);
    }
  }

  return makeCampInstances(campId, buckets);
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
