export interface Term {
  id: number;
  number: number;
  total_intensity: string;
  practice_hours: number;
  total_classroom_hours: number;
  solo_hours: number;
  intermediate_exam_type: string;
  classroom_activities: {
    courseproject_hours: number;
    coursework_hours: number;
    test_hours: number;
    seminar_hours: number;
    exam_hours: number;
    lecture_hours: number;
    laboratory_hours: number;
  };
}
