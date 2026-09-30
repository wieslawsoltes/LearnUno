import {lessons} from '../site/src/course.mjs';
import {dataWorkspaces} from '../site/src/learning/data-workspaces/lessons.mjs';
import {interfaceLessons} from '../site/src/learning/interface-patterns/lessons.mjs';
export const validationLessons=[...lessons,...dataWorkspaces,...interfaceLessons];
