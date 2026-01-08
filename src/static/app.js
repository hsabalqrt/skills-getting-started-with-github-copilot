document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create activity card structure
        const activityTitle = document.createElement("h4");
        activityTitle.textContent = name;

        const activityDesc = document.createElement("p");
        activityDesc.textContent = details.description;

        const activitySchedule = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule: ";
        activitySchedule.appendChild(scheduleStrong);
        activitySchedule.appendChild(document.createTextNode(details.schedule));

        const activityAvailability = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability: ";
        activityAvailability.appendChild(availStrong);
        activityAvailability.appendChild(document.createTextNode(`${spotsLeft} spots left`));

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeader = document.createElement("p");
        participantsHeader.className = "participants-header";
        const headerStrong = document.createElement("strong");
        headerStrong.textContent = "Participants:";
        participantsHeader.appendChild(headerStrong);

        participantsSection.appendChild(participantsHeader);

        // Add participants list or empty message
        if (details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";
          ul.setAttribute("data-activity", name);
          participantsSection.appendChild(ul);
        } else {
          const noParticipantsMsg = document.createElement("p");
          noParticipantsMsg.className = "no-participants";
          noParticipantsMsg.textContent = "No participants yet. Be the first to sign up!";
          participantsSection.appendChild(noParticipantsMsg);
        }

        activityCard.appendChild(activityTitle);
        activityCard.appendChild(activityDesc);
        activityCard.appendChild(activitySchedule);
        activityCard.appendChild(activityAvailability);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add participants with delete icon if any
        if (details.participants.length > 0) {
          const ul = activityCard.querySelector('.participants-list');
          details.participants.forEach(email => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const emailSpan = document.createElement('span');
            emailSpan.className = 'participant-email';
            emailSpan.textContent = email;

            const deleteSpan = document.createElement('span');
            deleteSpan.className = 'delete-participant';
            deleteSpan.title = 'Remove participant';
            deleteSpan.setAttribute('data-email', email);
            deleteSpan.setAttribute('data-activity', name);
            deleteSpan.textContent = '\u2716';

            li.appendChild(emailSpan);
            li.appendChild(deleteSpan);
            ul.appendChild(li);
          });
        }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete icons
      document.querySelectorAll('.delete-participant').forEach(icon => {
        icon.addEventListener('click', async (e) => {
          const email = e.target.getAttribute('data-email');
          const activity = e.target.getAttribute('data-activity');
          if (!confirm(`Remove ${email} from ${activity}?`)) return;
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`, {
              method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message || 'Participant removed.';
              messageDiv.className = 'success';
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || 'Failed to remove participant.';
              messageDiv.className = 'error';
            }
            messageDiv.classList.remove('hidden');
            setTimeout(() => { messageDiv.classList.add('hidden'); }, 5000);
          } catch (error) {
            messageDiv.textContent = 'Error removing participant.';
            messageDiv.className = 'error';
            messageDiv.classList.remove('hidden');
            setTimeout(() => { messageDiv.classList.add('hidden'); }, 5000);
            console.error('Error removing participant:', error);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
