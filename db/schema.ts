import {sqliteTable,text,primaryKey} from 'drizzle-orm/sqlite-core';
export const visits=sqliteTable('visits',{
 userId:text('user_id').notNull(),
 courseId:text('course_id').notNull(),
 visitedOn:text('visited_on').notNull().default(''),
 note:text('note').notNull().default(''),
 updatedAt:text('updated_at').notNull(),
},table=>[primaryKey({columns:[table.userId,table.courseId]})]);
