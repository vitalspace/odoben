<script>
  import DesktopSplash from "./components/DesktopSplash.svelte";
  import DesktopLogin from "./components/DesktopLogin.svelte";
  import Dashboard from "./components/Dashboard.svelte";
  import Toast from "./components/Toast.svelte";

  let currentView = "splash"; // splash, login, dashboard

  function handleSplashComplete() {
    // Check if token exists
    const token = localStorage.getItem("auth_token");
    if (token) {
      currentView = "dashboard";
    } else {
      currentView = "login";
    }
  }

  function handleLoginSuccess() {
    currentView = "dashboard";
  }
</script>

<main class="h-screen w-screen bg-odoben-bg text-odoben-text overflow-hidden">
  {#if currentView === "splash"}
    <DesktopSplash onComplete={handleSplashComplete} />
  {:else if currentView === "login"}
    <DesktopLogin onLoginSuccess={handleLoginSuccess} />
  {:else if currentView === "dashboard"}
    <Dashboard />
  {/if}

  <Toast />
</main>
