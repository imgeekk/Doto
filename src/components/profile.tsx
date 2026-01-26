import ProfileCard from "./ProfileCard";

const Profile = () => {
  return (
    <section className="min-h-[300px] flex items-stretch max-sm:flex-col">
      <figure className="flex-[1] flex sm:justify-center mb-5">
        <div className="max-sm:h-30 sm:h-40 md:h-50 lg:h-60 xl:h-70 max-sm:w-30 sm:w-40 md:w-50 lg:w-60 xl:w-70 relative overflow-hidden rounded-sm">
          {editMode ? (
            <AvatarUpload onFileChange={handleAvatarChange} />
          ) : data?.user.image ? (
            <Image
              src="/images/dp.jpg"
              alt="tefxt"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-start justify-center">
              <FaUser className="h-full w-full" />
            </div>
          )}
        </div>
      </figure>
      <section className="flex-[2] h-full sm:mx-3">
        <ProfileCard initialData={userData} setEditMode={setEditMode} />
      </section>
    </section>
  );
};

export default Profile;
