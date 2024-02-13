<script>
  const authorize = () => {
    fetch('/galafy/auth')
      .then((resonse) => resonse.json())
      .then((res) => {
        window.localStorage.setItem('spotify_state', res.state);
        window.location = res.url;
      });
  };
</script>

<div class="flex justify-center pt-10">
  <div class="card w-96">
    <div class="card-body">
      <h1 class="card-title">Login with Spotify</h1>
      <button class="btn btn-accent" on:click={authorize}>Authorize</button>
    </div>
  </div>
</div>
