const PasswordSection = ({
                             currentPassword,
                             setCurrentPassword,
                             newPassword,
                             setNewPassword,
                             confirmPassword,
                             setConfirmPassword,
                             errors
                         }) => {
    return (
        <div className="password-section">
            <h3>Change Password</h3>
            <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                />
                {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                />
                {errors.newPassword && <span className="error">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
        </div>
    );
};

export default PasswordSection;
