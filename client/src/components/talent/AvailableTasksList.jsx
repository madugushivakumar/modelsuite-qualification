import TaskCard from './TaskCard';
import PropTypes from "prop-types";
const AvailableTasksList = ({ tasks, onClaimed }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-bg-card border border-dashed border-border rounded-xl py-10 px-6 text-center text-text-faint text-sm">
        🎉 No open tasks right now — check back later!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} showClaimButton onClaimed={onClaimed} />
      ))}
    </div>
  );
};
AvailableTasksList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      dueDate: PropTypes.string,
      createdAt: PropTypes.string,
      assignedTo: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      createdBy: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    })
  ),
  onClaimed: PropTypes.func.isRequired,
};
export default AvailableTasksList;
