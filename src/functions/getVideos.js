export const fetchProjects = async (password) => {
  const projects = await ( await fetch(`https://api.wistia.com/v1/projects.json?api_password=${password}`)).json()

  if (projects.length) {
    return {
      success: true,
      projects
    }
  } else {
    return {
      success: false,
      error: projects.error
    }
  }
}

export const fetchVideos = async (projects, excludedProjects, password) => {

// Map through projects and return ids to retrieve all the videos from each project. Filter out the projects selected to be excluded
  const projectIds = projects.map((item) => item.hashedId).filter(id => {
    const include = excludedProjects.findIndex(project => project.hashedId === id ) === -1;
    return include;
  });
  const mappedProjects = await Promise.all(
    projectIds.map(async (id) => {
      const project = await (await fetch(`https://api.wistia.com/v1/projects/${id}.json?api_password=${password}`)).json()
      const mappedVideos = project.medias.map((video) => ({
        ...video,
        project: {
          id,
        },
      }));
      return mappedVideos;
    })
  );
  // Flatten array of arrays
  const videos = mappedProjects.flat(1);
  return videos;
}