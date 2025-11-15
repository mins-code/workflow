interface Project {
  id: string;
  title: string;
  // other fields optional for this test
}

interface Assignment {
  title: string;
  assigneeName: string;
  score: number;
}

async function testAssignment() {
  try {
    // 1. Fetch the Project ID
    console.log("🔍 Finding Project...");
    const projectsRes = await fetch('http://localhost:3000/api/projects');
    
    if (!projectsRes.ok) {
      throw new Error(`Failed to fetch projects: ${projectsRes.statusText}`);
    }

    // FIX: Cast the result using 'as'
    const projects = await projectsRes.json() as Project[];

    if (projects.length === 0) {
      console.error("❌ No projects found! Did you run the seed script?");
      return;
    }

    const projectId = projects[0].id;
    console.log(`✅ Found Project: "${projects[0].title}" (ID: ${projectId})`);

    // 2. Trigger Auto-Assignment
    console.log("\n🧠 Running Auto-Assignment Logic...");
    const assignRes = await fetch(`http://localhost:3000/api/projects/${projectId}/auto-assign`, {
      method: 'POST'
    });

    if (!assignRes.ok) {
      throw new Error(`Assignment failed: ${assignRes.statusText}`);
    }
    
    // FIX: Cast the result as any first to access nested properties safely
    const result = await assignRes.json() as any;

    // 3. Display Results
    console.log("\n📊 ASSIGNMENT RESULTS:");
    if (result.assignments) {
      result.assignments.forEach((task: any) => {
        console.log(`   👉 Task: "${task.taskTitle}" \n      Assigned to: 👤 ${task.assigneeName} (Score: ${task.score.toFixed(2)})`);
        console.log('      -----------------------------------');
      });
    } else {
      console.log("   Raw Result:", result);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testAssignment();