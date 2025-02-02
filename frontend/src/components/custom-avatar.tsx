import Avvvatars from "avvvatars-react";
import { Style } from "util";

type AvvvatarProps = {
    displayValue?: string;
    value: string;
    size?: number;
    shadow?: boolean;
    style?: Style;
    border?: boolean;
    borderSize?: number;
    borderColor?: string;
    radius?: number;
};

type CustomAvatarProps = AvvvatarProps & {
    className?: string;
};

export function CustomAvatar({
    value,
    displayValue,
    size = 40,
    radius = 10,
    className,
    border,
    borderSize,
    borderColor,
    shadow,
}: CustomAvatarProps) {
    return (
        <div className={className}>
            <Avvvatars
                value={value}
                style="shape"
                size={size}
                radius={radius}
                border={border}
                borderSize={borderSize}
                borderColor={borderColor}
                shadow={shadow}
                displayValue={displayValue}
            />
        </div>
    );
}
