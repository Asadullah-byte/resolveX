import fs from "fs";
import csvParser from "csv-parser";
import { prisma } from "./connectDB.js";
import moment from "moment";


async function importData() {
  const users = [];

  // Read CSV File
  fs.createReadStream("updated_tech_prisma_engineers_final_corrected.csv")
    .pipe(csvParser())
    .on("data", (row) => {
      users.push(row);
    })
    .on("end", async () => {
      for (const user of users) {
        try {
          // ✅ Ensure `role` is valid
          const role = user.role?.trim() === "Engineer" ? "Engineer" : "Client";

          // ✅ Ensure JSON fields are valid
          let skills = [];
          let socialAccounts = {};

          try {
            skills = user.skills ? JSON.parse(user.skills.replace(/'/g, '"')) : [];
          } catch (e) {
            console.warn(`⚠️ Invalid JSON in skills for ${user.email}, setting to empty array.`);
          }

          try {
            socialAccounts = user.socialAccounts
              ? JSON.parse(user.socialAccounts.replace(/'/g, '"'))
              : {};
          } catch (e) {
            console.warn(`⚠️ Invalid JSON in socialAccounts for ${user.email}, setting to empty object.`);
          }

          // ✅ Convert date fields properly
          const lastLogin = user.lastLogin
            ? moment(user.lastLogin, "YYYY-MM-DD HH:mm:ss").toDate()
            : null;

          const dob = user.dob ? moment(user.dob, "YYYY-MM-DD").toDate() : null;

          // ✅ Convert boolean fields properly
          const isVerified = user.isVerified?.toLowerCase() === "true";

          // ✅ Insert User
          const newUser = await prisma.user.create({
            data: {
              id: user.id || undefined, // Allow Prisma to generate UUID if missing
              fname: user.fname || "Unknown",
              lname: user.lname || null,
              email: user.email,
              password: user.password || null,
              lastLogin,
              isVerified,
              refreshToken: user.refreshToken || null,
              role,
            },
          });

          // ✅ If the user is an Engineer, insert into Engineer table
          if (role === "Engineer") {
            await prisma.engineer.create({
              data: {
                userId: newUser.id,
                gender: user.gender ? user.gender.toUpperCase() : null, // Convert to Enum
                dob,
                country: user.country || null,
                state: user.state || null,
                city: user.city || null,
                profilePic: user.profilePic || null,
                email: newUser.email,
                phoneNo: user.phoneNo || null,
                resume: user.resume || null,
                career: {
                  create: {
                    field: user.field || null,
                    specialization: user.specialization || null,
                    experience: user.experience ? parseInt(user.experience) : null,
                    bio: user.bio || null,
                    intro: user.intro || null,
                    skills: skills, // ✅ Validated JSON array
                    socialAccounts: socialAccounts, // ✅ Validated JSON object
                  },
                },
                education: {
                    create: {
                      institute: user.institute || "Unknown",
                      type: user.type ? user.type.toUpperCase() : null, // Convert to ENUM
                      major: user.field || null,
                      degree: user.degree || null,
                      marks: user.marks ? parseFloat(user.marks) : null, // Ensure it's a float
                      grade: user.grade || null,
                      startYear: user.startYear ? parseInt(user.startYear) : null,
                      endYear: user.endYear ? parseInt(user.endYear) : null,
                    },
                  },
              },
            });

            console.log(`✅ Engineer ${newUser.email} inserted successfully.`);
          } else {
            console.log(`✅ Client ${newUser.email} inserted successfully.`);
          }

        } catch (error) {
          console.error("❌ Error inserting user:", error);
        }
      }
      prisma.$disconnect();
    });
}

importData();
