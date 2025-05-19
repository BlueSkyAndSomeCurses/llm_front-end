const ProfileSectionView = ({name, setName, errors}) => {
    return (<div className="form-group">
        <label htmlFor="name">Name</label>
        <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
    </div>);
};

export default ProfileSectionView;
