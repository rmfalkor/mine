/*
========================================================
FORGE
Calisthenics + Martial Arts Academy
Frontend application
========================================================
*/


/* ======================================================
   USER DATA
====================================================== */

const defaultUser = {
  name: "Riwaj",
  xp: 1280,
  streak: 12,
  lessons: 24,
  level: 7
};

let user = JSON.parse(
  localStorage.getItem("forgeUser")
) || defaultUser;


/* ======================================================
   COURSE DATA
====================================================== */

const courses = [

  {
    id: "calisthenics",
    title: "Calisthenics",
    icon: "◈",
    category: "STRENGTH",
    description:
      "Master bodyweight strength from fundamentals to advanced skills.",
    tags: ["Push", "Core", "Handstand"],
    lessons: [
      ["Foundation", "Learn proper push-up mechanics", 30],
      ["Core Control", "Build strong body tension", 40],
      ["Pike Strength", "Develop overhead pressing strength", 45],
      ["Handstand Basics", "Learn safe handstand foundations", 60],
      ["Advanced Push", "Progress toward advanced pushing skills", 80]
    ]
  },

  {
    id: "boxing",
    title: "Boxing",
    icon: "◉",
    category: "STRIKING",
    description:
      "Learn boxing fundamentals, movement, defense and combinations.",
    tags: ["Footwork", "Defense", "Combos"],
    lessons: [
      ["Stance", "Learn the basic boxing stance", 30],
      ["Footwork", "Move efficiently and maintain balance", 40],
      ["Jab", "Learn the fundamental straight punch", 35],
      ["Defense", "Understand basic defensive movement", 50],
      ["Combinations", "Connect simple combinations", 60]
    ]
  },

  {
    id: "kickboxing",
    title: "Kickboxing",
    icon: "◇",
    category: "STRIKING",
    description:
      "Study controlled combinations, movement and conditioning.",
    tags: ["Kicks", "Combos", "Conditioning"],
    lessons: [
      ["Base Position", "Learn the basic stance", 30],
      ["Front Kick", "Study controlled kicking mechanics", 40],
      ["Round Kick", "Learn the movement pattern", 50],
      ["Combination Flow", "Connect basic techniques", 60],
      ["Conditioning", "Improve movement endurance", 70]
    ]
  },

  {
    id: "muaythai",
    title: "Muay Thai",
    icon: "△",
    category: "MARTIAL ART",
    description:
      "Explore traditional Muay Thai movement and fundamentals.",
    tags: ["Movement", "Balance", "Conditioning"],
    lessons: [
      ["Stance", "Learn the basic posture", 30],
      ["Movement", "Develop controlled movement", 40],
      ["Basic Strikes", "Understand foundational techniques", 50],
      ["Defense", "Learn basic defensive concepts", 60],
      ["Flow", "Combine fundamentals", 80]
    ]
  },

  {
    id: "mobility",
    title: "Mobility",
    icon: "∞",
    category: "RECOVERY",
    description:
      "Improve movement quality, flexibility and body control.",
    tags: ["Flexibility", "Control", "Recovery"],
    lessons: [
      ["Shoulder Mobility", "Improve shoulder movement", 25],
      ["Hip Mobility", "Build controlled hip range", 30],
      ["Spine Control", "Practice controlled spinal movement", 30],
      ["Deep Squat Mobility", "Improve lower-body mobility", 35],
      ["Full Body Flow", "Connect mobility patterns", 45]
    ]
  },

  {
    id: "conditioning",
    title: "Conditioning",
    icon: "⚡",
    category: "PERFORMANCE",
    description:
      "Build work capacity for better training performance.",
    tags: ["Cardio", "Endurance", "Recovery"],
    lessons: [
      ["Engine Basics", "Understand training intensity", 25],
      ["Intervals", "Learn controlled interval training", 40],
      ["Endurance", "Build sustainable conditioning", 45],
      ["Recovery", "Understand recovery principles", 30],
      ["Performance Test", "Measure your progress", 60]
    ]
  }

];


/* ======================================================
   LEADERBOARD
====================================================== */

let leaderboard = [

  {
    name: "ShadowFlow",
    xp: 6840,
    level: 19
  },

  {
    name: "KaiMotion",
    xp: 6120,
    level: 17
  },

  {
    name: "Atlas",
    xp: 5310,
    level: 15
  },

  {
    name: "Nova",
    xp: 4720,
    level: 13
  },

  {
    name: "Riwaj",
    xp: user.xp,
    level: user.level
  },

  {
    name: "Zenith",
    xp: 1100,
    level: 6
  },

  {
    name: "Mako",
    xp: 840,
    level: 5
  }

];


/* ======================================================
   SAVE USER
====================================================== */

function saveUser() {

  localStorage.setItem(
    "forgeUser",
    JSON.stringify(user)
  );

  /*
    BroadcastChannel allows different browser tabs
    to synchronize the same website instantly.

    A real online multiplayer database can later
    replace this with Firebase/Supabase.
  */

  if (window.forgeChannel) {

    window.forgeChannel.postMessage({
      type: "USER_UPDATE",
      user
    });

  }
}


/* ======================================================
   BROADCAST CHANNEL
====================================================== */

if ("BroadcastChannel" in window) {

  window.forgeChannel =
    new BroadcastChannel("forge_multiplayer");

  window.forgeChannel.onmessage = function(event) {

    if (
      event.data &&
      event.data.type === "USER_UPDATE"
    ) {

      user = event.data.user;

      renderUser();
      renderLeaderboard();

    }

  };

}


/* ======================================================
   RENDER USER
====================================================== */

function renderUser() {

  const initials =
    user.name
      .trim()
      .charAt(0)
      .toUpperCase();

  const xpIntoLevel = user.xp % 1000;

  const percent =
    Math.min(
      100,
      (xpIntoLevel / 1000) * 100
    );


  document.getElementById("navName").textContent =
    user.name;

  document.getElementById("navLevel").textContent =
    `Level ${user.level}`;

  document.getElementById("navAvatar").textContent =
    initials;


  document.getElementById("profileAvatar").textContent =
    initials;

  document.getElementById("profileName").textContent =
    user.name;

  document.getElementById("profileLevel").textContent =
    user.level;

  document.getElementById("profileXP").textContent =
    user.xp.toLocaleString();


  document.getElementById("heroLevel").textContent =
    `LVL ${String(user.level).padStart(2,"0")}`;


  document.getElementById("xpText").textContent =
    `${xpIntoLevel.toLocaleString()} XP`;


  document.getElementById("xpFill").style.width =
    `${percent}%`;


  document.getElementById("streakStat").textContent =
    user.streak;

  document.getElementById("lessonsStat").textContent =
    user.lessons;

  document.getElementById("pointsStat").textContent =
    user.xp.toLocaleString();


  updateRankName();
}


/* ======================================================
   RANK TITLE
====================================================== */

function updateRankName() {

  const rank =
    document.getElementById("heroRank");

  if (user.level >= 20) {

    rank.textContent = "ELITE FORGER";

  } else if (user.level >= 15) {

    rank.textContent = "MASTER ATHLETE";

  } else if (user.level >= 10) {

    rank.textContent = "ADVANCED WARRIOR";

  } else if (user.level >= 5) {

    rank.textContent = "RISING WARRIOR";

  } else {

    rank.textContent = "BEGINNER";

  }

}


/* ======================================================
   XP SYSTEM
====================================================== */

function addXP(amount) {

  user.xp += amount;

  user.level =
    Math.floor(user.xp / 1000) + 6;

  user.lessons++;

  saveUser();

  renderUser();

  renderLeaderboard();

  showToast(
    `+${amount} XP earned`
  );

}


/* ======================================================
   COURSE RENDER
====================================================== */

function renderCourses(list = courses) {

  const grid =
    document.getElementById("courseGrid");

  grid.innerHTML = "";

  list.forEach(course => {

    const card =
      document.createElement("div");

    card.className = "course";

    card.innerHTML = `

      <div class="course-icon">
        ${course.icon}
      </div>

      <div class="eyebrow">
        ${course.category}
      </div>

      <h3>${course.title}</h3>

      <p>
        ${course.description}
      </p>

      <div class="tags">
        ${course.tags
          .map(tag => `<span class="tag">${tag}</span>`)
          .join("")}
      </div>

      <button class="btn secondary">
        View Course →
      </button>

    `;

    card.addEventListener(
      "click",
      () => openCourse(course.id)
    );

    grid.appendChild(card);

  });

}


/* ======================================================
   COURSE SEARCH
====================================================== */

function filterCourses() {

  const query =
    document
      .getElementById("courseSearch")
      .value
      .toLowerCase();

  const filtered =
    courses.filter(course => {

      const text = `
        ${course.title}
        ${course.category}
        ${course.description}
        ${course.tags.join(" ")}
      `.toLowerCase();

      return text.includes(query);

    });

  renderCourses(filtered);

}


/* ======================================================
   OPEN COURSE
====================================================== */

function openCourse(courseId) {

  const course =
    courses.find(
      c => c.id === courseId
    );

  if (!course) return;


  document.getElementById(
    "modalCategory"
  ).textContent =
    course.category;


  document.getElementById(
    "modalTitle"
  ).textContent =
    course.title;


  document.getElementById(
    "modalDescription"
  ).textContent =
    course.description;


  const lessonList =
    document.getElementById(
      "lessonList"
    );

  lessonList.innerHTML = "";


  course.lessons.forEach(
    (lesson, index) => {

      const item =
        document.createElement("div");

      item.className = "lesson";

      item.innerHTML = `

        <strong>
          ${index + 1}. ${lesson[0]}
        </strong>

        <br>

        <small>
          ${lesson[1]} • ${lesson[2]} XP
        </small>

      `;

      item.onclick = () => {

        addXP(lesson[2]);

        item.style.opacity = ".45";

        item.innerHTML +=
          `<br><small style="color:#52e09a">
            ✓ Lesson completed
          </small>`;

      };

      lessonList.appendChild(item);

    }
  );


  document
    .getElementById("courseModal")
    .classList.add("show");

}


/* ======================================================
   CLOSE MODAL
====================================================== */

function closeModal() {

  document
    .getElementById("courseModal")
    .classList.remove("show");

}


document
  .getElementById("courseModal")
  .addEventListener(
    "click",
    function(event) {

      if (
        event.target === this
      ) {

        closeModal();

      }

    }
  );


/* ======================================================
   LEADERBOARD
====================================================== */

function renderLeaderboard() {

  const list =
    document.getElementById(
      "leaderboardList"
    );


  const data =
    leaderboard
      .map(person => {

        if (
          person.name === "Riwaj"
          ||
          person.name === user.name
        ) {

          return {
            ...person,
            name: user.name,
            xp: user.xp,
            level: user.level
          };

        }

        return person;

      })
      .sort(
        (a,b) => b.xp - a.xp
      );


  list.innerHTML = "";


  data.forEach(
    (person,index) => {

      const row =
        document.createElement("div");

      row.className =
        "leader " +
        (
          person.name === user.name
            ? "me"
            : ""
        );


      row.innerHTML = `

        <div class="leader-rank">
          #${index + 1}
        </div>

        <div>

          <div class="leader-name">
            ${person.name}
          </div>

          <div class="leader-meta">
            Level ${person.level}
          </div>

        </div>

        <div class="leader-xp">
          ${person.xp.toLocaleString()} XP
        </div>

      `;


      list.appendChild(row);

    }
  );

}


/* ======================================================
   DAILY CHALLENGE
====================================================== */

function completeChallenge() {

  const completed =
    localStorage.getItem(
      "forgeDailyChallenge"
    );

  if (completed) {

    showToast(
      "Daily challenge already completed."
    );

    return;

  }


  localStorage.setItem(
    "forgeDailyChallenge",
    "true"
  );


  addXP(250);

  showToast(
    "Daily Challenge completed! +250 XP"
  );

}


/* ======================================================
   DAILY CHALLENGE BUTTON
====================================================== */

function dailyChallenge() {

  scrollToSection("progress");

  setTimeout(
    () => {

      document
        .querySelector(".challenge")
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

    },
    200
  );

}


/* ======================================================
   CHANGE USERNAME
====================================================== */

function changeName() {

  const name =
    prompt(
      "Enter your Forge username:",
      user.name
    );


  if (!name) return;

  const clean =
    name.trim().slice(0,20);

  if (!clean) return;


  user.name = clean;

  saveUser();

  renderUser();

  renderLeaderboard();

}


/* ======================================================
   PROFILE
====================================================== */

function openProfile() {

  document
    .getElementById("profile")
    .scrollIntoView({
      behavior: "smooth"
    });

}


/* ======================================================
   NAVIGATION
====================================================== */

function scrollToSection(id) {

  const element =
    document.getElementById(id);

  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* ======================================================
   TOAST
====================================================== */

function showToast(message) {

  const toast =
    document.createElement("div");

  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.bottom = "25px";
  toast.style.right = "25px";
  toast.style.padding = "14px 18px";
  toast.style.borderRadius = "12px";
  toast.style.background = "#111823";
  toast.style.border = "1px solid rgba(94,231,255,.3)";
  toast.style.color = "white";
  toast.style.fontWeight = "700";
  toast.style.zIndex = "500";
  toast.style.boxShadow =
    "0 15px 50px rgba(0,0,0,.4)";

  document.body.appendChild(toast);


  setTimeout(
    () => {

      toast.style.opacity = "0";
      toast.style.transform =
        "translateY(10px)";

      toast.style.transition = ".3s";

    },
    1800
  );


  setTimeout(
    () => toast.remove(),
    2200
  );

}


/* ======================================================
   THREE.JS 3D BACKGROUND
====================================================== */

import * as THREE from
  "https://unpkg.com/three@0.171.0/build/three.module.js";


const canvas =
  document.getElementById(
    "three-bg"
  );


const scene =
  new THREE.Scene();


const camera =
  new THREE.PerspectiveCamera(
    65,
    window.innerWidth /
      window.innerHeight,
    0.1,
    100
  );


camera.position.z = 7;


const renderer =
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });


renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);


renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


/* ======================================================
   PARTICLE FIELD
====================================================== */

const particleCount = 1800;

const positions =
  new Float32Array(
    particleCount * 3
  );


for (
  let i = 0;
  i < particleCount * 3;
  i += 3
) {

  positions[i] =
    (Math.random() - .5) * 22;

  positions[i + 1] =
    (Math.random() - .5) * 14;

  positions[i + 2] =
    (Math.random() - .5) * 18;

}


const particleGeometry =
  new THREE.BufferGeometry();


particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(
    positions,
    3
  )
);


const particleMaterial =
  new THREE.PointsMaterial({
    color: 0x5ee7ff,
    size: .025,
    transparent: true,
    opacity: .65,
    blending:
      THREE.AdditiveBlending
  });


const particles =
  new THREE.Points(
    particleGeometry,
    particleMaterial
  );


scene.add(particles);


/* ======================================================
   3D WIREFRAME ICOSAHEDRONS
====================================================== */

const objects = [];


for (
  let i = 0;
  i < 10;
  i++
) {

  const geometry =
    new THREE.IcosahedronGeometry(
      .4 + Math.random() * .7,
      1
    );


  const material =
    new THREE.MeshBasicMaterial({
      color:
        i % 2
          ? 0x6578ff
          : 0xa66cff,
      wireframe: true,
      transparent: true,
      opacity: .16
    });


  const object =
    new THREE.Mesh(
      geometry,
      material
    );


  object.position.set(
    (Math.random() - .5) * 15,
    (Math.random() - .5) * 9,
    (Math.random() - .5) * 10
  );


  object.rotation.set(
    Math.random(),
    Math.random(),
    Math.random()
  );


  scene.add(object);

  objects.push(object);

}


/* ======================================================
   MOUSE PARALLAX
====================================================== */

let mouseX = 0;
let mouseY = 0;

window.addEventListener(
  "mousemove",
  event => {

    mouseX =
      (event.clientX /
        window.innerWidth -
        .5) * 2;

    mouseY =
      (event.clientY /
        window.innerHeight -
        .5) * 2;

  }
);


/* ======================================================
   ANIMATION
====================================================== */

const clock =
  new THREE.Clock();


function animate() {

  requestAnimationFrame(
    animate
  );


  const elapsed =
    clock.getElapsedTime();


  particles.rotation.y =
    elapsed * .012;


  particles.rotation.x =
    elapsed * .004;


  objects.forEach(
    (object,index) => {

      object.rotation.x +=
        .001 +
        index * .00008;

      object.rotation.y +=
        .0015;

      object.position.y +=
        Math.sin(
          elapsed * .4 + index
        ) * .0005;

    }
  );


  camera.position.x +=
    (mouseX * .25 -
      camera.position.x) *
    .025;


  camera.position.y +=
    (-mouseY * .18 -
      camera.position.y) *
    .025;


  camera.lookAt(0,0,0);


  renderer.render(
    scene,
    camera
  );

}


animate();


/* ======================================================
   RESPONSIVE 3D
====================================================== */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);


/* ======================================================
   INITIALIZE
====================================================== */

renderUser();

renderCourses();

renderLeaderboard();
