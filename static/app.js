$(document).ready(() => {
  (function scrollSpyObserver() {
    let options = {
      root: null,
      threshold: 0.2,
      rootMargin: "250px",
    };
    let documentation = document.querySelectorAll(".main-section");
    let callback = (entries, observer) => {
      entries.forEach((entry) => {
        // Toggle docuemntatuon links active
        if (entry.isIntersecting) {
          const scrollspy_targets = $("#scrollspy-nav .nav-link");
          const doc_id = entry.target.id;
          const doc_link = $(scrollspy_targets).filter(function () {
            return this.href.includes(doc_id);
          });
          $(scrollspy_targets).removeClass("active");
          $(doc_link).addClass("active");
        }
      });
    };
    let observer = new IntersectionObserver(callback, options);
    documentation.forEach((doc) => {
      observer.observe(doc);
    });
  })();

  /* handle documentation search bar*/
  (function handleDocSearch() {
    const datalist = $("#doc-datalist");
    $(".main-section").each(function () {
      const topic = $(this).find("header").text().trim();
      const option = `<option data-id="${this.id}" value="${topic}"/>`;
      $(datalist).append(option);
    });

    $("#doc-search").on("change", function () {
      const topic_id = this.value.replace(" ", "_").trim();
      const option = $("option").filter(function () {
        return $(this).data("id") == topic_id;
      });
      if (option[0]) {
        this.value = ""; // reset search
        window.location = "#" + $(option[0]).data("id");
      }
    });
  })();

  /* handle navbar collapse on mobile */
  (function handleNavMenu() {
    const navmenu = (menu = new bootstrap.Collapse($("#navmenu")));
    $("#main-doc").on("click touch", () => {
      if (navmenu._isShown()) {
        navmenu.hide(); // collapse menu
      }
    });
  })();

  /* update DOM with repo data */
  function updateGitElem(data) {
    $("#stars-total").text(data.stars);
    $("#issues-total").text(data.issues);
    $("#forks-total").text(data.forks);
  }

  /* Fetch Repo stats from GitHub */
  function fetchRepo() {
    // Fetch Github API and update Git Element
    const repo_url = "https://api.github.com/repos/cbedroid/pydatpiff";
    fetch(repo_url, {
      header: { accept: "application/vnd.github.V3+json" },
    }).then((resp) => resp.json())
    .then((data)=>{

      if (!data) return; // return immediately if Github data not found

      // Prepare and stored API data in  local Storage
      let repo_data = {
        last_update: new Date().getTime(),
        stars: data.stargazers_count || 0 ,
        issues: data.open_issues_count || 0 ,
        forks: data.forks || 0 ,
      };

      localStorage.pydatpiff = JSON.stringify(repo_data);
      // update DOM with new Repo data
      updateGitElem(repo_data);
    });
  }

(function handleLocalStorage() {
    // retrieve repo stats from local Storage
    let storage_data = localStorage.pydatpiff;
    const today = new Date().getTime();
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const refresh_date = ONE_DAY * 3; // 3 days

    if (!storage_data) return fetchRepo();
    storage_data = JSON.parse(storage_data);
    const last_refresh = today - storage_data.last_update; // refresh_date
    if (refresh_date <= last_refresh) {
      return fetchRepo();
    }
    // update Git Element from LocalStorage
    updateGitElem(storage_data);
  })();



});
