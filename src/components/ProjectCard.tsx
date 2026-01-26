const ProjectCard = () => {
  return <div className="flex p-2 border-1 mb-5">
    <div className="flex-1 hover:cursor-pointer">
      <h1 className="text-xl mb-1">First Project</h1>
      <p className="opacity-60">It is the first project of my fucking life</p>
      <p className="opacity-60">Wed 10:43</p>
    </div>
    <div className="flex items-center">--</div>
  </div>;
};

export default ProjectCard;
