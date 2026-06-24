const SUPABASE_URL ="https://akodraeqesulsofaanna.supabase.co";
const SUPABASE_KEY ="sb_publishable_q6jaRXcDuGa6qXCU4FZrfA_OObM1r2C";
const client =supabase.createClient(SUPABASE_URL,SUPABASE_KEY );

window.onload = function () 
{
    loadCoursesDropdown();
    loadUsers();
    loadCoursesTable();
    loadVideosTable();
    loadQuizDropdown();
    loadQuizTable();
    loadCollegeTable();
    loadmailIdDropdown();
    loadCollegeDropdown();
    loadStudentEnrollmentTable();
};

window.showPage = function(pageId,element)
 {
    document.querySelectorAll(".page").forEach(page => {page.classList.remove("active");});
    document.querySelectorAll(".menu-item").forEach(item => {item.classList.remove("active");});

    document
        .getElementById(pageId)
        .classList.add("active");

    element.classList.add("active");
};

/* SEARCH TABLE */

window.searchTable = function (input,tableId) 
{
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
        const text =row.innerText.toLowerCase();
        row.style.display = text.includes(filter)? "": "none";
    });
};

function togglePassword()
{
    const password = document.getElementById("password");
    const eye = document.getElementById("toggleEye");

    if (password.type === "password")
    {
        password.type = "text";
        eye.classList.replace("fa-eye", "fa-eye-slash");
    }
    else
    {
        password.type = "password";
        eye.classList.replace("fa-eye-slash", "fa-eye");
    }
}


window.selectRole = function (element, role) 
{

    document.querySelectorAll(".role-option").forEach(card => {card.classList.remove("active");});
    element.classList.add("active");
    document.getElementById("role").value = role;
};

window.doLogin = async function () 
{

    const username =document.getElementById("username").value;
    const password =document.getElementById("password").value;
    const role =document.getElementById("role").value;
    await login(username,password,role);
};

async function login(username, password, role)
{
    const { data, error } = await client
        .from("login")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("role", role);

    if (error)
    {
        document.getElementById("msg").innerHTML = error.message;
        return;
    }

    if (data.length === 0)
    {
        document.getElementById("msg").innerHTML = "Invalid Username or Password";
        return;
    }

    const user = data[0];

    // Student enrollment check
    if (user.role === "Student" && user.user_status !== "Enrolled")
    {
        document.getElementById("msg").innerHTML = "Your account is not enrolled yet. Please contact your tutor or administrator.";
        return;
    }

    localStorage.setItem("user", username);
    localStorage.setItem("role", user.role);

    /* ROLE BASED REDIRECT */

    if (user.role === "Admin")
    {
        window.location = "admin.html";
    }
    else if (user.role === "Tutor")
    {
        window.location = "tutor.html";
    }
    else if (user.role === "Student")
    {
        window.location = "student.html";
    }
}

/* CREATE USER */

async function createUser()
{
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newRole").value;

    if (!username || !password)
    {
        showMessage("Please enter username and password");
        return;
    }

    // Check duplicate username
    const { data: existingUser, error: checkError } = await client
        .from("login")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (checkError)
    {
        showMessage(checkError.message);
        return;
    }

    if (existingUser)
    {
        alert("Username already exists");
        return;
    }

    // Insert user
    const { error } = await client
        .from("login")
        .insert([
        {
            username: username,
            password: password,
            role: role,
            user_status: "Registered"
        }
        ]);

    if (error)
    {
        alert(error.message);
        return;
    }

    alert("User created successfully");

    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRole").selectedIndex = 0;
}
// window.bulkCreateUsers = async function ()
// {
//     const file = document.getElementById("studentFile").files[0];
//     if (!file)
//     {
//         showMessage("Please select an Excel file");
//         return;
//     }
//     try
//     {
//         // Read Excel File
//         const data = await file.arrayBuffer();
//         const workbook = XLSX.read(data, { type: "array" });
//         const worksheet =workbook.Sheets[workbook.SheetNames[0]];
//         const students =XLSX.utils.sheet_to_json(worksheet);
//         if (students.length === 0)
//         {
//             showMessage("Excel file is empty");
//             return;
//         }

//         // Get existing Reg Nos
//         const { data: existingStudents, error: fetchError } = await client.from("studentprofile").select("reg_no");
//         if (fetchError)
//         {
//             showMessage(fetchError.message);
//             return;
//         }

//         const existingRegNos = new Set(existingStudents.map(x => x.reg_no));

//         const loginUsers = [];
//         const studentProfiles = [];
//         const duplicateRegNos = [];
//         console.log(existingStudents);
//         console.log(fetchError);
//         students.forEach(student =>
//         {
//             const reg_no = String(student.reg_no).trim();
//             if (existingRegNos.has(reg_no))
//             {
//                 duplicateRegNos.push(reg_no);
//                 return;
//             }

//             loginUsers.push({
//                 username: reg_no,
//                 password: String(student.DOB || ""),
//                 role: "Student",
//                 user_status: "Registered"
//             });

//             studentProfiles.push({
//                 reg_no: reg_no,
//                 student_name: student.student_name || null,
//                 mail_id: student.mail_id || null,
//                 phone_no: student.phone_no || null,
//                 gender: student.gender || null,
//                 department: student.department || null,
//                 college_name: student.college_name || null,
//                 college_code: student.college_code || null,
//                 district: student.district || null,
//                 university: student.university || null,
//                 student_status: student.student_status || "Registered"
//             });
//         });

//         // Nothing to insert
//         if (studentProfiles.length === 0)
//         {
//             showMessage("All uploaded students already exist.");
//             return;
//         }

//         // Insert Login Records
//         const { error: loginError } =await client.from("login").insert(loginUsers);
//         if (loginError)
//         {
//             showMessage(loginError.message);
//             return;
//         }

//         // Insert Student Profiles
//         const { error: profileError } = await client.from("studentprofile").insert(studentProfiles);

//         if (profileError)
//         {
//             if (profileError.message.includes("studentenrollment_mail_id_key"))
//             {
//                 showMessage("Duplicate Mail ID already exists");
//             }
//             else
//             {
//                 showMessage(error.message);
//             }
//             await client.from("login").delete().in("username", loginUsers.map(x => x.username));
//             return;
//         }

//         document.getElementById("bulkSummaryCard").style.display = "block";
//         document.getElementById("totalCount").innerText = students.length;
//         document.getElementById("uploadedCount").innerText = studentProfiles.length;
//         document.getElementById("duplicateCount").innerText = duplicateRegNos.length;
//         document.getElementById("failedCount").innerText = 0;

//         if (duplicateRegNos.length > 0)
//         {
//             document.getElementById("duplicateRegs").innerText = duplicateRegNos.join(", ");
//         }
//         else
//         {
//             document.getElementById("duplicateRegs").innerText ="No duplicate register numbers found";
//         }

//     }
//     catch (err)
//     {
//         showMessage(err.message);
//     }
// };

window.bulkCreateUsers = async function ()
{
    const file = document.getElementById("studentFile").files[0];

    if (!file)
    {
        showMessage("Please select an Excel file");
        return;
    }

    try
    {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const students = XLSX.utils.sheet_to_json(worksheet);

        if (students.length === 0)
        {
            showMessage("Excel file is empty");
            return;
        }

        const { data: existingProfiles, error: fetchError } =
            await client
                .from("studentprofile")
                .select("reg_no, mail_id");

        if (fetchError)
        {
            showMessage(fetchError.message);
            return;
        }

        const existingRegNos =
            new Set(
                existingProfiles.map(
                    x => String(x.reg_no).trim()
                )
            );

        const existingMailIds =
            new Set(
                existingProfiles
                    .filter(x => x.mail_id)
                    .map(
                        x =>
                            x.mail_id
                                .toLowerCase()
                                .trim()
                    )
            );

        const loginUsers = [];
        const studentProfiles = [];
        const uploadReport = [];

        students.forEach(student =>
        {
            const reg_no =
                String(student.reg_no || "").trim();

            const mail_id =
                String(student.mail_id || "")
                    .trim()
                    .toLowerCase();

            if (existingRegNos.has(reg_no))
            {
                uploadReport.push({
                    reg_no,
                    mail_id,
                    status: "Duplicate Register Number"
                });

                return;
            }

            if (
                mail_id &&
                existingMailIds.has(mail_id)
            )
            {
                uploadReport.push({
                    reg_no,
                    mail_id,
                    status: "Duplicate Mail ID"
                });

                return;
            }

            loginUsers.push({
                username: reg_no,
                password: String(student.DOB || ""),
                role: "Student",
                user_status: "Registered"
            });

            studentProfiles.push({
                reg_no: reg_no,
                student_name: student.student_name || null,
                mail_id: student.mail_id || null,
                phone_no: student.phone_no || null,
                gender: student.gender || null,
                department: student.department || null,
                college_name: student.college_name || null,
                college_code: student.college_code || null,
                district: student.district || null,
                university: student.university || null,
                student_status:
                    student.student_status ||
                    "Registered"
            });

            uploadReport.push({
                reg_no,
                mail_id,
                status: "Success"
            });

            existingRegNos.add(reg_no);

            if (mail_id)
            {
                existingMailIds.add(mail_id);
            }
        });

        if (studentProfiles.length > 0)
        {
            const { error: loginError } =
                await client
                    .from("login")
                    .insert(loginUsers);

            if (loginError)
            {
                showMessage(loginError.message);
                return;
            }

            const { error: profileError } =
                await client
                    .from("studentprofile")
                    .insert(studentProfiles);

            if (profileError)
            {
                await client
                    .from("login")
                    .delete()
                    .in(
                        "username",
                        loginUsers.map(
                            x => x.username
                        )
                    );

                showMessage(profileError.message);
                return;
            }
        }

        const successCount =
            uploadReport.filter(
                x => x.status === "Success"
            ).length;

        const duplicateCount =
            uploadReport.filter(
                x =>
                    x.status ===
                        "Duplicate Register Number" ||
                    x.status ===
                        "Duplicate Mail ID"
            ).length;

        document.getElementById("bulkSummaryCard").style.display = "block";

        document.getElementById("totalCount").innerText =
            students.length;

        document.getElementById("uploadedCount").innerText =
            successCount;

        document.getElementById("duplicateCount").innerText =
            duplicateCount;

        document.getElementById("failedCount").innerText =
            duplicateCount;

        const duplicateRecords =
            uploadReport.filter(
                x => x.status !== "Success"
            );

        document.getElementById("duplicateRegs").innerHTML =
            duplicateRecords.length > 0
                ? duplicateRecords
                      .map(
                          x =>
                              `<div>
                                  <b>${x.reg_no}</b>
                                  - ${x.mail_id}
                                  - ${x.status}
                               </div>`
                      )
                      .join("")
                : "No duplicate records found";

        showMessage("Bulk upload completed successfully");
    }
    catch (err)
    {
        console.error(err);
        showMessage(err.message);
    }
};

function resetBulkUpload()
{
    // Hide summary report
    document.getElementById("bulkSummaryCard").style.display = "none";
    // Clear file selection
    document.getElementById("studentFile").value = "";
    // Reset counters
    document.getElementById("totalCount").innerText = "0";
    document.getElementById("uploadedCount").innerText = "0";
    document.getElementById("duplicateCount").innerText = "0";
    document.getElementById("failedCount").innerText = "0";
    // Clear duplicate list
    document.getElementById("duplicateRegs").innerText = "None";
}


/* LOAD USERS */

async function loadUsers() 
{
    const { data, error } =await client.from("login").select("*");
    if (error)
    {
        console.log(error);
        return;
    }
    const body =document.getElementById("usersBody");
    body.innerHTML = "";
    data.forEach(user => {
        body.innerHTML += `
            <tr>
                <td>
                    ${user.username}
                </td>
                <td>
                    ${user.password}
                </td>
                <td>
                    ${user.role}
                </td>
                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="editUser('${user.id}')">
                        Edit
                    </button>
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteUser('${user.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

/* OPEN EDIT POPUP */

async function editUser(id) 
{
    console.log("Edit Clicked");
    const { data, error } =await client.from("login").select("*").eq("id", id).single();
    if (error)
    {
        alert(error.message);
        return;
    }

    document.getElementById("editUserId").value = data.id;
    document.getElementById("editUsername").value = data.username;
    document.getElementById("editPassword").value = data.password;
    document.getElementById("editRole").value = data.role;
    document.getElementById("editUserModal").style.display = "flex";
}

/* CLOSE POPUP */

function closeEditModal() 
{
    document.getElementById("editUserModal").style.display = "none";
}

/* UPDATE USER */

async function updateUser() 
{
    const id =document.getElementById("editUserId").value;
    const username = document.getElementById("editUsername").value;
    const password =document.getElementById("editPassword").value;
    const role =document.getElementById("editRole").value;
    const { error } =
        await client
            .from("login")
            .update({
                username,
                password,
                role
            })
            .eq("id", id);

    if (error) 
    {
        alert(error.message);
        return;
    }
    alert("User Updated Successfully");
    closeEditModal();
    loadUsers();
}

/* DELETE USER */

async function deleteUser(id) 
{
    const ok =confirm("Delete this user?");
    if (!ok) 
    {
        return;
    }
    const { error } =await client.from("login").delete().eq("id", id);
    if (error) 
    {
        alert(error.message);
        return;
    }
    alert("User Deleted");
    loadUsers();
}

/* GLOBAL FUNCTIONS */

window.editUser = editUser;
window.updateUser = updateUser;
window.deleteUser = deleteUser;
window.closeEditModal = closeEditModal;

/* LOAD COURSES IN DROPDOWN */

async function loadCoursesDropdown() 
{
    const { data, error } = await client.from("courses").select("*");
    if (error)
    {
        return;
    }
    const dropdown =document.getElementById("videoCourse");
    dropdown.innerHTML = "";
    data.forEach(course => {
        dropdown.innerHTML += `
            <option value="${course.id}">
                ${course.course_name}
            </option>
        `;
    });
}

/* ADD COURSE */

window.addCourse = async function ()
{
    const title = document.getElementById("courseTitle").value;
    const description =document.getElementById("courseDescription").value;
    const file =document.getElementById("courseThumbnail").files[0];
    if (!file)
    {
        alert("Select Image");
        return;
    }

    /* UNIQUE FILE NAME */

    const fileName =Date.now() +"_" +file.name;

    /* UPLOAD IMAGE */
    const { error: uploadError } =await client.storage.from("thumbnails").upload(fileName,file);

    if (uploadError) 
    {
        alert(uploadError.message);
        return;
    }

    /* GET PUBLIC URL */
    const { data } =client.storage.from("thumbnails").getPublicUrl(fileName);
    const thumbnail = data.publicUrl;

    /* SAVE COURSE */

    const { error } =
        await client
            .from("courses")
            .insert([
                {
                    title,
                    description,
                    thumbnail
                }
            ]);

    if (error) 
    {
        alert(error.message);
        return;
    }
    alert("Course Added Successfully");

    /* CLEAR FIELDS */

    document.getElementById("courseTitle").value = "";
    document.getElementById("courseDescription").value = "";
    document.getElementById("courseThumbnail").value = "";
    loadCoursesTable();
    loadCoursesDropdown();
};

/* LOAD COURSES */

async function loadCoursesTable()
{
    const { data, error } = await client.from("courses").select("*");
    if (error)
    {
        console.log(error);
        return;
    }
    const body =document.getElementById("coursesBody");
    body.innerHTML = "";
    data.forEach(course =>
    {
        body.innerHTML += `
            <tr>
                <td>
                    ${course.title}
                </td>

                <td>
                    ${course.description}
                </td>
                <td>
                    <img
                        src="${course.thumbnail}"
                        width="80"
                        style="
                            border-radius:10px;
                            object-fit:cover;
                        ">
                </td>
                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="openEditCourseModal('${course.id}')">
                        Edit
                    </button>
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteCourse('${course.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

/* OPEN EDIT COURSE MODAL */

window.openEditCourseModal =async function (id)
{
    const { data, error } = await client.from("courses").select("*").eq("id", id).single();

    if (error)
    {
        alert(error.message);
        return;
    }

    document.getElementById("editCourseId").value = data.id;
    document.getElementById("editCourseName").value = data.title;
    document.getElementById("editCourseDescription").value = data.description;
    document.getElementById("previewThumbnail").src = data.thumbnail;
    document.getElementById("editCourseModal").style.display = "flex";
};

/* UPDATE COURSE */

window.updateCourse =async function ()
{
    const id =document.getElementById("editCourseId").value;
    const title =document.getElementById("editCourseName").value;
    const description =document.getElementById("editCourseDescription").value;
    const file =document.getElementById("editCourseThumbnail").files[0];
    let thumbnail =document.getElementById("previewThumbnail").src;

    /* UPLOAD NEW IMAGE */

    if (file)
    {
        const fileName =Date.now() +"_" +file.name;
        const { error: uploadError } =await client.storage.from("thumbnails").upload(fileName,file );

        if (uploadError)
        {
            alert(uploadError.message);
            return;
        }
        const { data } =client.storage.from("thumbnails").getPublicUrl(fileName);
        thumbnail = data.publicUrl;
    }

    /* UPDATE DATABASE */
    const { error } = await client.from("courses").update({title,description,thumbnail}).eq("id", id);
    if (error)
    {
        alert(error.message);
        return;
    }
    alert("Course Updated Successfully");
    closeCourseModal();
    loadCoursesTable();
};

/* DELETE COURSE */

window.deleteCourse =async function (id) 
{
    const ok = confirm("Delete this course?");
    if (!ok) 
    {
        return;
    }
    const { error } =await client.from("courses").delete().eq("id", id);
    if (error) 
    {
        alert(error.message);
        return;
    }
    loadCoursesTable();
    alert("Course Deleted");
};

/* CLOSE MODAL */

window.closeCourseModal =function ()
{
    document.getElementById("editCourseModal").style.display = "none";
};

/* ADD VIDEO */

window.addVideo = async function () {

    const course_id =document.getElementById("videoCourse").value;
    const module_name =document.getElementById("moduleName").value;
    const video_title =document.getElementById("videoTitle").value;
    const quiz_id = document.getElementById("quizId").value;
    const file =document.getElementById("videoFile").files[0];

    if (!file) 
    {
        alert("Please select MP4 file" );
        return;
    }

    const fileName =`${Date.now()}_${file.name}`;
    // Upload to Supabase Storage
    const { error: uploadError } = await client.storage.from("videos").upload(fileName, file);

    if (uploadError) 
    {
        alert(uploadError.message);
        return;
    }

    // Get Public URL

    const { data } =client.storage.from("videos").getPublicUrl(fileName );
    const video_url =data.publicUrl;

    // Save in Database

    const { error } =
        await client
            .from("videos")
            .insert([
                {
                    course_id,
                    module_name,
                    video_title,
                    video_url,
                    quiz_id
                }
            ]);

    if (error) 
    {
         if (error.code === "23505")
        {
            alert("Module already exists");
            return;
        }
        alert(error.message);
        return;
    }
    alert("Video Added Successfully");
    /* CLEAR FIELDS */
    document.getElementById("videoCourse").selectedIndex = 0;
    document.getElementById("moduleName").value = "";
    document.getElementById("videoTitle").value = "";
    document.getElementById("videoFile").value = "";
    document.getElementById("videoFile").value = "";
    document.getElementById("quizId").value="";
};

async function loadVideosTable()
{
    // Get videos

    const { data: videos } =
        await client
            .from("videos")
            .select("*");

    // Get courses
    const { data: courses } =
        await client
            .from("courses")
            .select("*");

    const body =document.getElementById("videosBody");
    body.innerHTML = "";
    videos.forEach(video => {
        // Find course name using course_id
        const course =courses.find(c => c.id == video.course_id);
        const courseName =course? course.title: "";
        body.innerHTML += `
            <tr>
                <td>
                    ${courseName}
                </td>
                <td>
                    ${video.module_name}
                </td>
                <td>
                    ${video.video_title}
                </td>
                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="openEditVideoModal('${video.id}')">
                        Edit
                    </button>
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteVideo('${video.id}')">
                        Delete
                    </button>
                </td>
           </tr>
        `;
    });
}

window.openEditVideoModal = async function (id)
{
    // Get selected video

    const { data, error } = await client.from("videos").select("*").eq("id", id).single();

    if (error)
    {
        alert(error.message);
        return;
    }

    // Load all courses

    const { data: courses } = await client.from("courses").select("*");
    const courseDropdown =document.getElementById("editVideoCourse");
    courseDropdown.innerHTML = "";

    // Fill dropdown

    courses.forEach(course =>
    {
        courseDropdown.innerHTML += `
            <option value="${course.id}">
                ${course.title}
            </option>
        `;
    });

    // Set selected course
    courseDropdown.value=data.course_id;
    // Set other fields
    document.getElementById("editVideoId").value = data.id;
    document.getElementById("editModuleName").value = data.module_name;
    document.getElementById("editVideoTitle").value = data.video_title;
    document.getElementById("editvideoURL").value = data.video_url;
    // Open modal
    document.getElementById("editVideoModal").style.display = "flex";
};

async function updateVideo()
{
    const id =document.getElementById("editVideoId").value;
    const course_id =document.getElementById("editVideoCourse").value;
    const module_name =document.getElementById("editModuleName").value;
    const video_title =document.getElementById("editVideoTitle").value;
    // Generate Quiz ID
    const courseDropdown =document.getElementById("editVideoCourse");
    const course =courseDropdown.options[courseDropdown.selectedIndex].text.trim().replace(/\s+/g, "_");
    const module =module_name.trim().replace(/\s+/g, "_");
    let quiz_id = "";
    if (course && module)
    {
        quiz_id = `${course}_${module}`;
    }
    let updateData = {course_id, module_name,video_title,quiz_id};

    const file =document.getElementById("editVideoFile").files[0];
    // Upload new file if selected
    if (file)
    {
        const fileName =`${Date.now()}_${file.name}`;
        await client.storage.from("videos").upload(fileName,file);
        const { data } =client.storage.from("videos").getPublicUrl(fileName);
        updateData.video_url = data.publicUrl;
    }
    const { error } =await client.from("videos").update(updateData).eq("id", id);
    if (error)
    {
        alert(error.message );
        return;
    }
    alert("Video Updated Successfully");
    closeVideoModal();
    loadVideosTable();
}

async function deleteVideo(id)
{
    const confirmDelete =confirm("Are you sure want to delete this video?" );
    if (!confirmDelete)
    {
        return;
    }
    // Get video details
    const { data } =
        await client
            .from("videos")
            .select("*")
            .eq("id", id)
            .single();

    // Delete file from storage
    if (data?.video_url)
    {
        const fileName = data.video_url.split("/").pop();
        await client.storage.from("videos").remove([fileName]);
    }

    // Delete DB record
    const { error } =await client.from("videos").delete().eq("id", id);
    if (error)
    {
       alert(error.message);
       return;
    }
    alert("Video Deleted Successfully");
    loadVideosTable();
}

function closeVideoModal()
{
    document.getElementById("editVideoModal").style.display = "none";
}

/* ADD QUIZ QUESTION */

window.addQuizQuestion = async function ()
 {

    const quiz_id = document.getElementById("quizIdDropDown").value;
    const question = document.getElementById("question").value;
    const option1 = document.getElementById("option1").value;
    const option2 = document.getElementById("option2").value;
    const option3 = document.getElementById("option3").value;
    const option4 = document.getElementById("option4").value;
    const correct_answer =document.getElementById("correctAnswer").value;

    const { error } =
        await client
            .from("quizzes")
            .insert([
                {
                    quiz_id,
                    question,
                    option1,
                    option2,
                    option3,
                    option4,
                    correct_answer
                }
            ]);

    if (error) 
    {

        alert(error.message);            
        return;
    }

    alert("Quiz Question Added Successfully");

    /* CLEAR FIELDS */

    document.getElementById("quizIdDropDown").selectedIndex=0;
    document.getElementById("question").value="";
    document.getElementById("option1").value="";
    document.getElementById("option2").value="";
    document.getElementById("option3").value="";
    document.getElementById("option4").value="";
    document.getElementById("correctAnswer").value="";
};

async function loadQuizDropdown()
{
    const dropdown =document.getElementById("quizIdDropDown");
    dropdown.innerHTML = "";
    const { data, error } = await client.from("videos").select("quiz_id");
    if (error)
    {
        alert(error.message);
        return;
    }

    dropdown.innerHTML =`<option value="">Select Quiz Id</option>`;
    data.forEach(video =>
    {
        if (video.quiz_id)
        {
            dropdown.innerHTML += `
                <option
                    value="${video.quiz_id}">
                    ${video.quiz_id}
                </option>
            `;
        }
    });
}

/* LOAD QUIZ */

async function loadQuizTable() 
{
    const { data } =await client.from("quizzes").select("*");
    const body = document.getElementById("quizBody");
    body.innerHTML = "";
    data.forEach(q => {
        body.innerHTML += `
            <tr>
                <td>
                    ${q.quiz_id}
                </td>
                <td>
                    ${q.question}
                </td>
                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="openEditQuizModal('${q.id}')">
                        Edit
                    </button>
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteQuiz('${q.id}')">
                        Delete
                    </button>
                </td>

            </tr>
        `;
    });
}

window.openEditQuizModal = async function (id)
{
    const { data, error } = await client.from("quizzes").select("*").eq("id", id).single();
    if (error)
    {
        alert(error.message);
        return;
    }

    const { data: videos } = await client.from("videos").select("*");
    const dropdown =document.getElementById("editQuizId");
    dropdown.innerHTML = "";

    videos.forEach(video =>
    {
        if (video.quiz_id)
        {
            dropdown.innerHTML += `
                <option
                    value="${video.quiz_id}">
                    ${video.quiz_id}
                </option>
            `;
        }
    });


    // Set selected item
    dropdown.value=data.quiz_id;
    // Set other fields
    document.getElementById("editId").value = data.id;
    document.getElementById("editQuizId").value = data.quiz_id;
    document.getElementById("editQuestion").value = data.question;
    document.getElementById("editOption1").value = data.option1;
    document.getElementById("editOption2").value = data.option2;
    document.getElementById("editOption3").value = data.option3;
    document.getElementById("editOption4").value = data.option4;
    document.getElementById("editAnswer").value = data.correct_answer;
    
    // Open modal
    document.getElementById("editQuizModal").classList.add("show");
    //document.getElementById("editQuizModal").style.display = "flex";
};


/* EDIT QUIZ */

window.updateQuiz =async function (id) 
{

    const idVal =document.getElementById("editId").value;
    const quiz_id =document.getElementById("editQuizId").value;
    const question =document.getElementById("editQuestion").value;
    const option1 =document.getElementById("editOption1").value;
    const option2 =document.getElementById("editOption2").value;
    const option3 =document.getElementById("editOption3").value;
    const option4 =document.getElementById("editOption4").value;
    const correct_answer =document.getElementById("editAnswer").value;
    
    let updateData = {quiz_id, question,option1,option2,option3,option4,correct_answer};
    const { error } =await client.from("quizzes").update(updateData).eq("id", idVal);
    if (error)
    {
        alert(error.message );
        return;
    }
    alert("Quiz Updated Successfully");
    closeVideoModal();
    loadQuizTable();
};

function closeQuizModal()
{
    //document.getElementById("editQuizModal").style.display = "none";
    document
        .getElementById("editQuizModal")
        .classList.remove("show");
}


async function deleteQuiz(id)
{
    const confirmDelete =confirm("Are you sure want to delete this Quiz question?" );
    if (!confirmDelete)
    {
        return;
    }
    
    // Delete DB record
    const { error } =await client.from("quizzes").delete().eq("id", id);
    if (error)
    {
       alert(error.message);
       return;
    }
    alert("Quiz Questions Deleted Successfully");
    loadQuizTable();
}

/* ADD COLLEGE */

window.addCollege = async function ()
 {
    const college_name = document.getElementById("college_name").value;
    const place = document.getElementById("place").value;
    const { error } =
        await client
            .from("colleges")
            .insert([
                {
                    college_name,
                    place
                }
            ]);

    if (error) 
    {

        alert(error.message);            
        return;
    }

    alert("College has been Added Successfully");

    /* CLEAR FIELDS */

    document.getElementById("college_name").value="";
    document.getElementById("place").value="";
};


/* LOAD College */

async function loadCollegeTable() 
{
    const { data } =await client.from("colleges").select("*");
    const body = document.getElementById("collegeBody");
    body.innerHTML = "";
    data.forEach(q => {
        body.innerHTML += `
            <tr>
                <td>
                    ${q.college_name}
                </td>
                <td>
                    ${q.place}
                </td>
                <td>
                    <button
                        class="action-btn edit-btn"
                        onclick="openEditCollegeModal('${q.id}')">
                        Edit
                    </button>
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteCollege('${q.id}')">
                        Delete
                    </button>
                </td>

            </tr>
        `;
    });
}

window.openEditCollegeModal = async function (id)
{
    const { data, error } = await client.from("colleges").select("*").eq("id", id).single();
    if (error)
    {
        alert(error.message);
        return;
    }

    const { data: colleges } = await client.from("colleges").select("*");
    
    document.getElementById("editCollegeId").value = data.id;
    document.getElementById("editCollegeName").value = data.college_name;
    document.getElementById("editPlace").value = data.place;
    
    // Open modal
    document.getElementById("editCollegeModal").classList.add("show");
    //document.getElementById("editQuizModal").style.display = "flex";
};


/* EDIT QUIZ */

window.updateCollege =async function (id) 
{
    const collegeid = document.getElementById("editCollegeId").value;
    const college_name =document.getElementById("editCollegeName").value;
    const place =document.getElementById("editPlace").value;
    
    let updateData = {college_name,place};
    const { error } =await client.from("colleges").update(updateData).eq("id", collegeid);
    if (error)
    {
        alert(error.message );
        return;
    }
    alert("college Updated Successfully");
    closeCollegeModal();
    loadCollegeTable();
};

function closeCollegeModal()
{
    //document.getElementById("editQuizModal").style.display = "none";
    document
        .getElementById("editCollegeModal")
        .classList.remove("show");
}


async function deleteCollege(id)
{
    const confirmDelete =confirm("Are you sure want to delete this College?" );
    if (!confirmDelete)
    {
        return;
    }
    
    // Delete DB record
    const { error } =await client.from("colleges").delete().eq("id", id);
    if (error)
    {
       alert(error.message);
       return;
    }
    alert("College Deleted Successfully");
    loadCollegeTable();
}

/* STUDENT ENROLLMENT */

window.doEnrollment = async function ()
{
    const mailIdEl = document.getElementById("mailIdDropDown");
    const nameEl = document.getElementById("studentName");
    const regNoEl = document.getElementById("studentRegNo");
    const collegeEl = document.getElementById("collegeDropDown");

    if (!mailIdEl || !nameEl || !regNoEl || !collegeEl) return;

    const mail_id = mailIdEl.value;
    const student_name = nameEl.value;
    const reg_no = regNoEl.value;
    const college_name = collegeEl.value;
    
    const { error } =
        await client
            .from("studentenrollment")
            .insert([
                {
                    mail_id,
                    student_name,
                    reg_no,
                    college_name
                }
            ]);

    if (error) 
    {
        alert(error.message);            
        return;
    }

    alert("Student enrollment completed Successfully");

    /* CLEAR FIELDS */
    mailIdEl.selectedIndex = 0;
    nameEl.value = "";
    regNoEl.value = "";
    collegeEl.selectedIndex = 0;
};

async function loadmailIdDropdown()
{
    const dropdown = document.getElementById("mailIdDropDown");
    if (!dropdown) return;
    dropdown.innerHTML = "";

    // Get enrolled mail ids
    const {data: enrolled, error: enrollError} = await client.from("studentenrollment").select("mail_id");

    if (enrollError) 
    {
        alert(enrollError.message);
        return;
    }

    const enrolledMails = enrolled.map(x => x.mail_id);

    // Get only NOT enrolled students
    const {data, error} = await client.from("login").select("username").eq("role", "Student")
        .not(
            "username",
            "in",
            `(${enrolledMails
                .map(m => `"${m}"`)
                .join(",")})`
        );

    if (error) 
    {
        alert(error.message);
        return;
    }
    dropdown.innerHTML = `<option value="">Select Student</option>`;
    // Fill dropdown
    data.forEach(student => {
        dropdown.innerHTML += `
            <option value="${student.username}">
                ${student.username}
            </option>
        `;
    });
}

async function loadCollegeDropdown()
{
    const dropdown = document.getElementById("collegeDropDown");
    if (!dropdown) return;
    dropdown.innerHTML = "";
    
    const { data, error } = await client.from("colleges").select("college_name");
    if (error)
    {
        alert(error.message);
        return;
    }

    dropdown.innerHTML = `<option value="">Select College</option>`;
    data.forEach(colleges =>
    {
        if (colleges.college_name)
        {
            dropdown.innerHTML += `
                <option value="${colleges.college_name}">
                    ${colleges.college_name}
                </option>
            `;
        }
    });
}

/* LOAD student enrollment */

async function loadStudentEnrollmentTable() 
{
    const body = document.getElementById("studentEnrollmentBody");
    if (!body) return;
    body.innerHTML = "";

    const { data } = await client.from("studentenrollment").select("*");
    if (data) {
        data.forEach(q => {
            body.innerHTML += `
                <tr>
                    <td>
                        ${q.student_name}
                    </td>
                    <td>
                        ${q.mail_id}
                    </td>
                    <td>
                        <button
                            class="action-btn edit-btn"
                            onclick="openStudentEnrollmentModal('${q.id}')">
                            Edit
                        </button>
                        <button
                            class="action-btn delete-btn"
                            onclick="deleteStudentEnrollment('${q.id}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

window.openStudentEnrollmentModal = async function (id)
{
    const modal = document.getElementById("editStudentEnrollmentModal");
    const dropdown = document.getElementById("editCollageNameDropDown");
    const idEl = document.getElementById("editStudentEnrollmentId");
    const mailEl = document.getElementById("editStudentMailID");
    const nameEl = document.getElementById("editStudentName");
    const regNoEl = document.getElementById("editStudentRegNo");

    if (!modal || !dropdown || !idEl || !mailEl || !nameEl || !regNoEl) return;

    // Get selected enrollment
    const {data, error } = await client.from("studentenrollment").select("*").eq("id", id).single();

    if (error)
    {
        alert(error.message);
        return;
    }

    // Get colleges
    const {data: colleges, error: collegeError} = await client.from("colleges").select("*");

    if (collegeError)
    {
        alert(collegeError.message);
        return;
    }

    dropdown.innerHTML = "";

    colleges.forEach(college =>
    {
        if (college.college_name)
        {
            dropdown.innerHTML += `
                <option value="${college.college_name}">
                    ${college.college_name}
                </option>
            `;
        }
    });

    // Set selected college and fill fields
    dropdown.value = data.college_name || "";
    idEl.value = data.id;
    mailEl.value = data.mail_id;
    nameEl.value = data.student_name;
    regNoEl.value = data.reg_no;

    // Open modal
    modal.classList.add("show");
};


/* EDIT STUDENT ENROLLMENT*/

window.updateStudentEnrollment = async function (id) 
{
    const idEl = document.getElementById("editStudentEnrollmentId");
    const nameEl = document.getElementById("editStudentName");
    const regNoEl = document.getElementById("editStudentRegNo");
    const collegeEl = document.getElementById("editCollageNameDropDown");

    if (!idEl || !nameEl || !regNoEl || !collegeEl) return;

    const student_enrollmentID = idEl.value;
    const student_name = nameEl.value;
    const reg_no = regNoEl.value;
    const college_name = collegeEl.value;
    
    let updateData = { student_name, reg_no, college_name };
    const { error } = await client.from("studentenrollment").update(updateData).eq("id", student_enrollmentID);
    if (error)
    {
        alert(error.message );
        return;
    }
    alert("Enrollment Updated Successfully");
    closeStudentEnrollmentModal();
    loadStudentEnrollmentTable();
};

function closeStudentEnrollmentModal()
{
    const modal = document.getElementById("editStudentEnrollmentModal");
    if (modal) modal.classList.remove("show");
}


async function deleteStudentEnrollment(id)
{
    const confirmDelete = confirm("Are you sure want to delete this student enrollment?" );
    if (!confirmDelete)
    {
        return;
    }
    
    // Delete DB record
    const { error } = await client.from("studentenrollment").delete().eq("id", id);
    if (error)
    {
       alert(error.message);
       return;
    }
    alert("student enrollment Deleted Successfully");
    loadStudentEnrollmentTable();
}

window.loadStudentCourses =
    async function ()
{
    const courseDiv =
        document.getElementById(
            "courseList"
        );

    courseDiv.innerHTML = "";

    const {
        data,
        error
    } = await client
        .from("courses")
        .select("*");

    if (error)
    {
        alert(error.message);
        return;
    }

    data.forEach(course =>
    {
        courseDiv.innerHTML += `

            <div
                class="course-card"
                onclick="loadModules('${course.id}')">

                ${course.course_name}

            </div>
        `;
    });
};



















// //no need

// async function loadCourses() 
// {

//     const { data, error } = await client.from("courses").select("*");

//     if (error) 
//     {
//         console.log(error);
//         return;
//     }

//     const list = document.getElementById("courseList");

//     list.innerHTML = "";

//     data.forEach(course => {

//         list.innerHTML += `
//             <div class="course-card"
//                  onclick="openCourse('${course.id}')">

//                 <img src="${course.thumbnail}">

//                 <div class="course-content">

//                     <h2>${course.title}</h2>

//                     <p>${course.description}</p>

//                 </div>

//             </div>
//         `;
//     });
// }

// function openCourse(courseId) 
// {
//     localStorage.setItem("courseId",courseId);
//     window.location ="course-details.html";
// }

// function enableQuiz()
// {
//     document.getElementById("quizBtn").disabled = false;
// }



// let questions = [];

// async function loadQuiz()
// {
//     const quizId =localStorage.getItem("quizId");
//     const { data, error } = await client.from("questions").select("*").eq("quiz_id", quizId);
//     questions = data;
//     const form =document.getElementById("quizForm");
//     form.innerHTML = "";
//     data.forEach((q, index) => {
//         form.innerHTML += `
//             <div>
//                 <h3>
//                     Question ${index + 1}:
//                     ${q.question}
//                 </h3>
//                 <input type="radio"
//                        name="q${index}"
//                        value="${q.option1}">
//                        ${q.option1}
//                 <br>
//                 <input type="radio"
//                        name="q${index}"
//                        value="${q.option2}">
//                        ${q.option2}
//                 <br>
//                 <input type="radio"
//                        name="q${index}"
//                        value="${q.option3}">
//                        ${q.option3}
//                 <br>
//                 <input type="radio"
//                        name="q${index}"
//                        value="${q.option4}">
//                        ${q.option4}

//                 <br><br>

//             </div>
//         `;
//     });
// }

// async function submitQuiz()
// {
//     if (questions.length === 0) 
//     {
//         alert("No Questions Found");
//         return;
//     }

//     let score = 0;
//     questions.forEach((q, index) => {
//         const selected = document.querySelector(`input[name="q${index}"]:checked`);
//         if (selected && selected.value === q.correct_answer) 
//         {

//             score++;
//         }
//     });

//     alert("Your Score: " + score);

//     await client.from("results").insert([
//             {
//                 user_email:localStorage.getItem("user"),
//                 quiz_id:questions[0].quiz_id,
//                 score: score
//             }
//         ]);

//     if (score >= 2)
//      {
//         window.location ="certificate.html";
//     }
//     else
//    {

//         alert("Quiz Failed");
//     }
// }

// function logout() {

//     localStorage.removeItem("user");

//     window.location =
//         "login.html";
// }









function showMessage(msg) {

    document.getElementById(
        "adminMsg"
    ).innerHTML = msg;
}

// /* LOAD COURSE DROPDOWN FOR QUIZ */

// async function loadQuizCourses() {

//     const { data, error } =

//         await client
//             .from("courses")
//             .select("*");

//     if (error) {

//         return;
//     }

//     const dropdown =

//         document.getElementById(
//             "quizCourse"
//         );

//     dropdown.innerHTML = `

//         <option>

//             Select Course

//         </option>
//     `;

//     data.forEach(course => {

//         dropdown.innerHTML += `

//             <option value="${course.id}">

//                 ${course.title}

//             </option>
//         `;
//     });
// }



















