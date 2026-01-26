interface ColumnWrapperProps {
    children: React.ReactNode;
}

const ColumnWrapper = ({children}: ColumnWrapperProps) => {
  return (
    <li className="shrink-0 h-full w-[272px] select-none">
        {children}
    </li>
  )
}

export default ColumnWrapper